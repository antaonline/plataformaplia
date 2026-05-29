import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import * as fs from 'fs';
import { join } from 'path';
import {
  constructSystemPrompt,
  extractThemeFromPrompt,
  generateInitialAiRules,
  DEFAULT_AI_RULES,
} from './prompts/system-prompt.service';
import { analyzeEditIntent, EditType } from './prompts/intent-analyzer';
import { CodegenService } from './generation/codegen.service';
import { CreditService } from './generation/credit.service';
import { ChatMsg } from './generation/codegen.types';
import { WorkspaceService } from './workspace.service';

export type ChatMode = 'build' | 'ask' | 'plan';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private codegen: CodegenService,
    private credits: CreditService,
    private workspace: WorkspaceService,
  ) {}

  /** Extrae el ultimo set de archivos generados a partir de los bloques [FILES]. */
  private collectExistingFiles(
    messages: { role: string; content: string }[],
  ): Record<string, string> {
    const acc: Record<string, string> = {};
    for (const m of messages) {
      const fm = m.content?.match(/\[FILES\]([\s\S]*?)\[\/FILES\]/);
      if (fm) {
        try {
          Object.assign(acc, JSON.parse(fm[1]));
        } catch {
          /* ignora bloques corruptos */
        }
      }
    }
    // NO borrar /__design__.json ni /__deps__.json: codegen los necesita
    // para PRESERVAR el design system y las deps al editar (si se borran
    // aqui, la tipografia/paleta se regeneran y cambian).
    return acc;
  }

  /** Historial limpio (sin metadatos internos) para el contexto del modelo. */
  private buildHistory(
    messages: { role: string; content: string }[],
  ): ChatMsg[] {
    return messages
      .slice(-10)
      .map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as
          | 'assistant'
          | 'user',
        content: this.cleanMessageForContext(m.content),
      }))
      .filter((m) => m.content.trim().length > 0);
  }

  /** Construye el contenido persistido con el contrato [META][RESPONSE][FILES]. */
  private composeMessage(result: {
    meta: any;
    response: string;
    files: Record<string, string>;
    dependencies: Record<string, string>;
  }): string {
    const files = { ...result.files };
    if (result.dependencies && Object.keys(result.dependencies).length > 0) {
      files['/__deps__.json'] = JSON.stringify(result.dependencies);
    }
    return `[META]${JSON.stringify(result.meta)}[/META][RESPONSE]${
      result.response
    }[/RESPONSE]\n\n[FILES]${JSON.stringify(files)}[/FILES]`;
  }

  // ============================================================
  // CREAR CHAT — Fase de Planificación (3 conceptos iniciales)
  // ============================================================
  async createChat(userId: number, initialPrompt: string) {
    // 0. Verificar creditos ANTES de crear nada (lanza 403 si agotado).
    await this.credits.assertCanGenerate(userId);

    // 1. Generar AI_RULES.md inicial a partir del primer prompt
    const initialAiRules = generateInitialAiRules(initialPrompt);
    const themePrompt = extractThemeFromPrompt(initialPrompt);

    // 2. Crear el chat con las reglas iniciales ya guardadas
    const chat = await this.prisma.aiChat.create({
      data: {
        userId,
        title: initialPrompt.substring(0, 50),
        aiRules: initialAiRules,
        themePrompt: themePrompt || null,
        chatMode: 'build',
      } as any,
    });

    await this.prisma.aiMessage.create({
      data: { chatId: chat.id, role: 'user', content: initialPrompt },
    });

    // 3. La generacion agentica corre en SEGUNDO PLANO. Devolvemos el chat
    // de inmediato para que el front haga la transicion estilo Claudable
    // (pantalla de "razonando" + tareas) mientras la IA construye.
    void this.runInitialGeneration(chat.id, userId, initialPrompt, initialAiRules);

    return chat;
  }

  /** Genera el proyecto inicial en background y persiste el mensaje del asistente. */
  private async runInitialGeneration(
    chatId: number,
    userId: number,
    initialPrompt: string,
    initialAiRules: string,
  ): Promise<void> {
    let finalContent: string;
    try {
      const result = await this.codegen.generate({
        userId,
        userPrompt: initialPrompt,
        history: [],
        aiRules: initialAiRules,
        chatMode: 'build',
      });
      finalContent = this.composeMessage(result);
      await this.credits.consume(
        userId,
        Math.max(1, Number((result.meta as any)?.creditsUsed) || 1),
      );
    } catch (e: any) {
      this.logger.error('Error inicializando chat (codegen):', e.message);
      const meta = {
        thinking: 'Error al contactar con la IA.',
        conceptName: 'Nuevo Proyecto',
        steps: ['Reintenta el envio'],
        chatMode: 'build',
      };
      finalContent = `[META]${JSON.stringify(
        meta,
      )}[/META][RESPONSE]Lo siento, no pude generar el proyecto inicial. Por favor, intenta de nuevo.[/RESPONSE]\n\n[FILES]{}[/FILES]`;
    }

    await this.prisma.aiMessage.create({
      data: { chatId, role: 'assistant', content: finalContent },
    });
  }

  // ============================================================
  // ENVIAR MENSAJE — Construcción y edición de la web
  // ============================================================
  async sendMessage(
    chatId: number,
    userId: number,
    content: string,
    chatMode?: ChatMode,
    images?: string[],
  ) {
    // 1. Obtener datos del chat (incluye aiRules y themePrompt)
    const chat = await this.prisma.aiChat.findUnique({ where: { id: chatId } });
    if (!chat || chat.userId !== userId) throw new NotFoundException('Chat no encontrado');

    const activeMode: ChatMode = (chatMode || (chat as any).chatMode || 'build') as ChatMode;

    // 2. Persistir mensaje del usuario
    await this.prisma.aiMessage.create({
      data: { 
        chatId, 
        role: 'user', 
        content,
        images: images && images.length > 0 ? JSON.stringify(images) : null,
      } as any,
    });

    // 3. Obtener historial completo
    const history = await this.prisma.aiMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Límite para no exceder el contexto del modelo
    });

    // 4. Analizar intención del usuario (de Open-Lovable)
    const intent = analyzeEditIntent(content);

    // 5. Construir el system prompt modular (de Dyad)
    const systemPrompt = constructSystemPrompt({
      aiRules: (chat as any).aiRules || DEFAULT_AI_RULES,
      chatMode: activeMode,
      themePrompt: (chat as any).themePrompt || undefined,
      projectContext: intent.contextHint,
    });

    // 6. Preparar mensajes para la IA (filtrando metadatos internos)
    const messages = history.map((m) => {
      let msgImages: string[] | undefined = undefined;
      try {
        if (m.images) {
          msgImages = JSON.parse(m.images);
        }
      } catch (e) {
        this.logger.error('Error parseando imágenes del mensaje:', e.message);
      }

      return {
        role: m.role,
        content: this.cleanMessageForContext(m.content),
        images: msgImages,
      };
    });

    // 7. Llamar a la IA
    try {
      // Modo ASK: respuesta texto libre (no JSON)
      if (activeMode === 'ask') {
        const textResponse = await (this.aiService as any).chat(
          'gemini-flash-latest',
          systemPrompt,
          JSON.stringify(messages),
        );
        const responseText = typeof textResponse === 'string'
          ? textResponse
          : textResponse?.content || 'No pude procesar tu consulta.';

        return this.prisma.aiMessage.create({
          data: {
            chatId,
            role: 'assistant',
            content: `[RESPONSE]${responseText}[/RESPONSE]`,
          },
        });
      }

      // Modo BUILD o PLAN: pipeline agentico (plan -> archivo por archivo)
      await this.credits.assertCanGenerate(userId);
      const priorHistory = history.slice(0, -1); // sin el mensaje recien añadido
      const existingFiles = this.collectExistingFiles(priorHistory);
      const aiRules =
        ((chat as any).aiRules || DEFAULT_AI_RULES) +
        `\n\n# Contexto de la edicion\n${intent.contextHint}`;

      const result = await this.codegen.generate({
        userId,
        userPrompt: content,
        history: this.buildHistory(priorHistory),
        aiRules,
        chatMode: activeMode,
        existingFiles:
          Object.keys(existingFiles).length > 0 ? existingFiles : undefined,
        // FAST PATH: pasamos el intent al codegen para que pueda saltar
        // la fase de PLAN cuando el cambio es claro y especifico (ej.
        // "modificar Hero" / "cambiar colores"). Ahorra ~30% del costo.
        editIntent: {
          type: String(intent.type),
          confidence: intent.confidence,
          targetSection: intent.targetSection,
        },
      });

      result.meta.intent = {
        type: intent.type,
        description: intent.description,
      };
      await this.credits.consume(
        userId,
        Math.max(1, Number((result.meta as any)?.creditsUsed) || 1),
      );
      const finalContent = this.composeMessage(result);

      return this.prisma.aiMessage.create({
        data: { chatId, role: 'assistant', content: finalContent },
      });
    } catch (e: any) {
      const errorMsg = e.response?.data?.error?.message || e.message || 'Error desconocido';
      return this.prisma.aiMessage.create({
        data: {
          chatId,
          role: 'assistant',
          content: `[RESPONSE]⚠️ Error en el motor de IA: ${errorMsg}. Por favor, reintenta.[/RESPONSE]`,
        },
      });
    }
  }

  // ============================================================
  // GESTIÓN DE AI_RULES (equivalente al AI_RULES.md de Dyad)
  // ============================================================

  async getAiRules(chatId: number, userId: number): Promise<{ aiRules: string; chatMode: string }> {
    const chat = await this.getChat(chatId, userId);
    return {
      aiRules: (chat as any).aiRules || DEFAULT_AI_RULES,
      chatMode: (chat as any).chatMode || 'build',
    };
  }

  async updateAiRules(
    chatId: number,
    userId: number,
    aiRules: string,
    chatMode?: ChatMode,
  ) {
    await this.getChat(chatId, userId);
    return this.prisma.aiChat.update({
      where: { id: chatId },
      data: {
        aiRules,
        ...(chatMode && { chatMode }),
      } as any,
    });
  }

  // ============================================================
  // PUBLICAR PROYECTO (Sprint 2)
  //
  // Flujo nuevo:
  //  1. Garantiza que el workspace exista (clona el scaffold + symlink
  //     a node_modules del scaffold maestro).
  //  2. Escribe los archivos generados por la IA en workspaces/<id>/src/.
  //  3. Corre `npm run build` (Vite emite a dist/ con paths relativos).
  //  4. Copia el dist a uploads/studio-dist/<id>/ que Nest sirve estatico.
  //  5. Guarda la URL publica en aiChat.previewUrl.
  //
  // Resultado: el cliente ve su SPA real funcionando en
  //  https://api.plia.pe/uploads/studio-dist/<chatId>/index.html
  // ============================================================
  async publish(chatId: number, userId: number, files: Record<string, string>) {
    await this.getChat(chatId, userId);

    if (!this.workspace.isScaffoldReady()) {
      throw new NotFoundException(
        'El motor PLIA Studio aun no esta listo en este servidor (falta npm install en scaffolds/plia-studio-base/). Contacta a soporte.',
      );
    }

    // 1) Inicializar workspace (idempotente).
    this.workspace.init(chatId);

    // 2) Volcar los archivos generados por la IA.
    // Filtrar metadata interna del iachat (__design__, __deps__, etc.).
    const cleanFiles: Record<string, string> = {};
    for (const [path, content] of Object.entries(files || {})) {
      if (typeof content !== 'string') continue;
      if (path.startsWith('/__') || path.startsWith('__')) continue;
      cleanFiles[path] = content;
    }
    this.workspace.writeFiles(chatId, cleanFiles);

    // 3) Build con Vite.
    try {
      this.workspace.build(chatId);
    } catch (e: any) {
      this.logger.error(`publish chat=${chatId} build fallo: ${e?.message || e}`);
      throw e;
    }

    // 4) Deploy local (servimos via /uploads).
    const previewUrl = this.workspace.deployLocal(chatId);

    // 5) Persistir URL.
    await this.prisma.aiChat.update({
      where: { id: chatId },
      data: { previewUrl },
    });

    return {
      success: true,
      previewUrl,
      message: 'Proyecto publicado correctamente.',
    };
  }

  // ============================================================
  // THUMBNAIL — captura del preview para las tarjetas del dashboard
  // ============================================================
  async saveThumbnail(chatId: number, userId: number, dataUrl: string) {
    await this.getChat(chatId, userId); // verifica dueño
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return { success: false };
    }
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');
    // Limite defensivo (~4MB) para no guardar basura enorme.
    if (buf.length > 4 * 1024 * 1024) return { success: false };
    const dir = join(process.cwd(), 'uploads', 'thumbnails');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(join(dir, `${chatId}.png`), buf);
    return { success: true };
  }

  // ============================================================
  // CRUD BÁSICO
  // ============================================================

  async getChat(id: number, userId: number) {
    const chat = await this.prisma.aiChat.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!chat || chat.userId !== userId) throw new NotFoundException('Chat no encontrado');
    return chat;
  }

  async getUserCredits(userId: number) {
    const s = await this.credits.status(userId);
    return {
      plan: s.plan,
      planLabel: s.planLabel,
      dailyUsed: s.dailyUsed,
      totalLimit: s.dailyLimit,
      remaining: s.remainingDaily,
      monthlyUsed: s.monthlyUsed,
      monthlyLimit: s.monthlyLimit,
      remainingMonthly: s.remainingMonthly,
    };
  }

  async getUserHistory(userId: number) {
    return this.prisma.aiChat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, title: true, status: true, chatMode: true, createdAt: true, updatedAt: true } as any,
    });
  }

  async renameChat(chatId: number, userId: number, title: string) {
    await this.getChat(chatId, userId);
    return this.prisma.aiChat.update({ where: { id: chatId }, data: { title } });
  }

  async deleteChat(chatId: number, userId: number) {
    await this.getChat(chatId, userId);
    await this.prisma.aiMessage.deleteMany({ where: { chatId } });
    return this.prisma.aiChat.delete({ where: { id: chatId } });
  }

  // ============================================================
  // UTILIDADES PRIVADAS
  // ============================================================

  /**
   * Limpia el contenido de los mensajes para no enviar metadatos
   * internos ([META], [FILES], [PLANNING]) al contexto de la IA.
   */
  private cleanMessageForContext(content: string): string {
    if (!content) return '';
    return content
      .replace(/\[META\][\s\S]*?\[\/META\]/g, '')
      .replace(/\[FILES\][\s\S]*?\[\/FILES\]/g, '[archivos de código generados anteriormente]')
      .replace(/\[PLANNING\][\s\S]*?\[\/PLANNING\]/g, '')
      .replace(/\[RESPONSE\]([\s\S]*?)\[\/RESPONSE\]/g, '$1')
      .trim();
  }
}
