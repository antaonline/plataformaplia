import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AiChatService, ChatMode } from './iachat.service';

@Controller('experimental/iachat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  // ---- Historial y créditos ----

  @Get('credits')
  getCredits(@Request() req: any) {
    return this.aiChatService.getUserCredits(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.aiChatService.getUserHistory(req.user.id);
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
