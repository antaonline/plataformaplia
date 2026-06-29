import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, Request, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AiChatService, ChatMode } from './iachat.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PROVIDERS, resolveProviderForModel } from './generation/providers';
import { StudioPlansService } from './studio-plans/studio-plans.service';
import {
  onboardingTurn,
  briefToRichPrompt,
  OnboardingTurnMessage,
} from './onboarding-conversation';

/**
 * Ping minimal a un modelo: 1 mensaje "ping", 5 tokens max. Mide latencia,
 * exito/fallo, y si falla devuelve status HTTP del proveedor. Sirve para
 * diagnosticar en vivo si una API key esta cap-eada, sin tier paid, o si
 * un modelo dejo de existir.
 */
async function pingModel(model: string): Promise<{
  model: string;
  provider: string;
  ok: boolean;
  latencyMs: number;
  status?: number | string;
  error?: string;
  output?: string;
}> {
  const provider = resolveProviderForModel(model);
  const start = Date.now();
  if (!provider.isAvailable()) {
    return {
      model,
      provider: provider.id,
      ok: false,
      latencyMs: 0,
      error: 'API key no configurada en .env',
    };
  }
  try {
    const out = await provider.complete(
      'Eres un eco. Responde solo con la palabra: pong',
      [{ role: 'user', content: 'ping' }],
      { model, maxTokens: 8, temperature: 0 },
    );
    return {
      model,
      provider: provider.id,
      ok: true,
      latencyMs: Date.now() - start,
      output: (out || '').trim().slice(0, 40),
    };
  } catch (e: any) {
    return {
      model,
      provider: provider.id,
      ok: false,
      latencyMs: Date.now() - start,
      status: e?.response?.status || e?.code,
      error:
        e?.response?.data?.error?.message ||
        JSON.stringify(e?.response?.data || {}).slice(0, 200) ||
        e?.message ||
        String(e),
    };
  }
}

@Controller('experimental/iachat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(
    private readonly aiChatService: AiChatService,
    private readonly prisma: PrismaService,
    private readonly studioPlans: StudioPlansService,
  ) {}

  // ---- Diagnostico de providers (solo ADMIN) ----
  // GET /api/experimental/iachat/diag/providers
  // Pingea cada modelo configurado y reporta cual responde OK, cual da 429,
  // cual da 404, latencias. Util para entender en vivo si la API key esta
  // en el tier correcto, si los nombres de modelo son validos, etc.
  @Get('diag/providers')
  async diagProviders(@Request() req: any) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: req.user.id },
      select: { role: true, email: true },
    });
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Solo ADMIN puede ver el diagnostico');
    }

    const geminiModels = [
      'gemini-2.5-pro',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
    ];
    const claudeModels = [
      process.env.ANTHROPIC_MODEL_SONNET || 'claude-sonnet-4-6',
      process.env.ANTHROPIC_MODEL_HAIKU || 'claude-haiku-4-5-20251001',
    ];
    const openaiModels = [process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o'];

    // Pingueamos en paralelo (cada provider tiene su propio bucket de rate).
    const results = await Promise.all(
      [...geminiModels, ...claudeModels, ...openaiModels].map((m) => pingModel(m)),
    );

    const summary = {
      gemini: {
        keyConfigured: !!process.env.GOOGLE_GEMINI_KEY,
        keyPreview: (process.env.GOOGLE_GEMINI_KEY || '').slice(0, 8) + '...',
        ok: results.filter((r) => r.provider === 'gemini' && r.ok).length,
        total: geminiModels.length,
      },
      claude: {
        keyConfigured: !!process.env.ANTHROPIC_API_KEY,
        keyPreview: (process.env.ANTHROPIC_API_KEY || '').slice(0, 10) + '...',
        ok: results.filter((r) => r.provider === 'claude' && r.ok).length,
        total: claudeModels.length,
      },
      openai: {
        keyConfigured: !!process.env.OPENAI_API_KEY,
        keyPreview: (process.env.OPENAI_API_KEY || '').slice(0, 7) + '...',
        ok: results.filter((r) => r.provider === 'openai' && r.ok).length,
        total: openaiModels.length,
      },
    };

    return { summary, results };
  }

  // ---- Historial y créditos ----

  @Get('credits')
  getCredits(@Request() req: any) {
    return this.aiChatService.getUserCredits(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.aiChatService.getUserHistory(req.user.id);
  }

  // ---- Onboarding conversacional con IA real ----
  // POST /api/experimental/iachat/onboarding-turn
  // El frontend llama a esto en CADA mensaje del usuario durante el
  // onboarding centrado. La IA decide la siguiente pregunta con criterio
  // o, cuando tiene suficiente, devuelve done:true + richPrompt para crear
  // el chat. Reemplaza el wizard scripted de chips predefinidos.
  @Post('onboarding-turn')
  @HttpCode(HttpStatus.OK)
  async onboardingTurn(
    @Request() req: any,
    @Body() body: { messages: OnboardingTurnMessage[] },
  ) {
    // Capabilities del plan para que la IA sepa qué estilos ofrecer.
    let canUsePremium3D = false;
    let isPaid = false;
    let planName = 'Plia Studio Free';
    try {
      const caps = await this.studioPlans.getCapabilities(req.user.id);
      canUsePremium3D = !!caps.tools?.tripo3d;
      isPaid = !!caps.isPaid;
      planName = caps.planName;
    } catch {
      /* sin caps: defaults conservadores (free) */
    }

    const result = await onboardingTurn(
      Array.isArray(body.messages) ? body.messages : [],
      { planName, isPaid, canUsePremium3D },
    );

    // Si la IA decidió construir, generamos el richPrompt aquí (el front
    // no necesita conocer el formato [META]).
    if (result.done && result.brief) {
      return {
        done: true,
        reply: result.reply,
        richPrompt: briefToRichPrompt(result.brief),
        brief: result.brief,
      };
    }
    return { done: false, reply: result.reply };
  }

  // ---- CRUD de chats ----

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChat(@Request() req: any, @Body() body: { initialPrompt: string }) {
    return this.aiChatService.createChat(req.user.id, body.initialPrompt);
  }

  @Get(':id')
  getChat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.aiChatService.getChat(id, req.user.id);
  }

  /**
   * Edición visual (Fase B): aplica un cambio del lienzo (editar texto,
   * reemplazar imagen) directo a los archivos, sin pasar por la IA.
   * Devuelve los archivos actualizados para que el front los sincronice
   * al preview (Vite HMR recarga).
   */
  @Post(':id/visual-edit')
  @HttpCode(HttpStatus.OK)
  visualEdit(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body()
    body:
      | { kind: 'text'; oldText: string; newText: string }
      | { kind: 'image'; oldSrc: string; newUrl: string },
  ) {
    return this.aiChatService.applyVisualEdit(id, req.user.id, body);
  }

  /**
   * Override de estilo del editor visual (padding/tamaño/tipografía/color).
   * Lo escribe en `src/plia-overrides.css` del proyecto para que persista en
   * el código y viaje al exportar/publicar.
   */
  @Post(':id/style-override')
  @HttpCode(HttpStatus.OK)
  styleOverride(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { path: string; style: Record<string, string>; breakpoint?: string },
  ) {
    return this.aiChatService.applyStyleOverride(id, req.user.id, body);
  }

  /** Inserta una sección nueva (snippet) en la página, sin pasar por la IA. */
  @Post(':id/insert-section')
  @HttpCode(HttpStatus.OK)
  insertSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { html: string },
  ) {
    return this.aiChatService.insertSection(id, req.user.id, body);
  }

  /** Elimina una sección insertada por la paleta (por su data-plia-section). */
  @Post(':id/delete-section')
  @HttpCode(HttpStatus.OK)
  deleteSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { sectionId: string },
  ) {
    return this.aiChatService.deleteSection(id, req.user.id, body);
  }

  /** Etiqueta secciones inline antiguas para volverlas eliminables. Idempotente. */
  @Post(':id/normalize-sections')
  @HttpCode(HttpStatus.OK)
  normalizeSections(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.aiChatService.normalizeSections(id, req.user.id);
  }

  /** Reordena un bloque de la página (hijo de <main>) arriba/abajo. */
  @Post(':id/move-section')
  @HttpCode(HttpStatus.OK)
  moveSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { index: number; dir: 'up' | 'down' },
  ) {
    return this.aiChatService.moveSection(id, req.user.id, body);
  }

  /** Duplica un bloque de la página (hijo de <main>), debajo del original. */
  @Post(':id/duplicate-section')
  @HttpCode(HttpStatus.OK)
  duplicateSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { index: number },
  ) {
    return this.aiChatService.duplicateSection(id, req.user.id, body);
  }

  /** Lee los colores actuales del tema (hex) para el panel de tema global. */
  @Get(':id/theme')
  getTheme(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.aiChatService.getTheme(id, req.user.id);
  }

  /** Recolorea el sitio completo (tokens :root del CSS de tema). */
  @Post(':id/theme')
  @HttpCode(HttpStatus.OK)
  setTheme(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { tokens: Record<string, string> },
  ) {
    return this.aiChatService.setTheme(id, req.user.id, body);
  }

  @Patch(':id/rename')
  renameChat(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { title: string },
  ) {
    return this.aiChatService.renameChat(id, req.user.id, body.title);
  }

  @Delete(':id')
  deleteChat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.aiChatService.deleteChat(id, req.user.id);
  }

  // ---- Enviar mensaje (soporta chatMode) ----

  @Post(':id/message')
  @HttpCode(HttpStatus.OK)
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { content: string; chatMode?: ChatMode; images?: string[] },
  ) {
    return this.aiChatService.sendMessage(id, req.user.id, body.content, body.chatMode, body.images);
  }

  // ---- AI_RULES por proyecto (inspirado en Dyad) ----

  @Get(':id/ai-rules')
  getAiRules(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.aiChatService.getAiRules(id, req.user.id);
  }

  @Patch(':id/ai-rules')
  updateAiRules(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { aiRules: string; chatMode?: ChatMode },
  ) {
    return this.aiChatService.updateAiRules(id, req.user.id, body.aiRules, body.chatMode);
  }

  // ---- Publicar proyecto ----

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { files: Record<string, string> },
  ) {
    return this.aiChatService.publish(id, req.user.id, body.files);
  }

  // ---- Thumbnail (captura del preview para las tarjetas) ----

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  saveThumbnail(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { dataUrl: string },
  ) {
    return this.aiChatService.saveThumbnail(id, req.user.id, body.dataUrl);
  }
}
