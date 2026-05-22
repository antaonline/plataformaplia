import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { IsObject, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { PreviewService } from './preview.service';
import * as http from 'http';
import type { Response as ExpressResponse } from 'express';

class PreviewFilesDto {
  @IsObject()
  @IsOptional()
  files?: Record<string, string>;
}

/** Endpoints protegidos por JWT: start, sync, stop, status. */
@Controller('experimental/preview')
@UseGuards(JwtAuthGuard)
export class PreviewController {
  constructor(
    private readonly previewService: PreviewService,
    private readonly prisma: PrismaService,
  ) {}

  private async assertOwner(chatId: number, userId: number) {
    const chat = await this.prisma.aiChat.findUnique({ where: { id: chatId } });
    if (!chat || chat.userId !== userId) {
      throw new NotFoundException('Chat no encontrado');
    }
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: PreviewFilesDto,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.start(id, body.files || {});
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: PreviewFilesDto,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.sync(id, body.files || {});
  }

  @Post(':id/stop')
  @HttpCode(HttpStatus.OK)
  async stop(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.stop(id);
  }

  @Get(':id/status')
  async status(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.assertOwner(id, req.user.id);
    return this.previewService.getStatus(id);
  }
}

/**
 * Proxy público (sin JWT) hacia el servidor Vite local.
 * El iframe del Studio apunta a /experimental/preview/:id/serve/* para no
 * tener que acceder directamente a http://127.0.0.1:PORT (inaccesible desde el
 * browser del cliente). La URL sólo la conoce quien recibió el previewUrl.
 */
@Controller('experimental/preview')
export class PreviewProxyController {
  constructor(private readonly previewService: PreviewService) {}

  // Matchea /serve y /serve/cualquier/ruta. *path captura el segmento opcional.
  @Get(':id/serve*path')
  async serveProxy(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res() res: ExpressResponse,
  ) {
    const localUrl = this.previewService.getLocalUrl(id);
    if (!localUrl) {
      res.status(503).json({ error: 'Preview no está corriendo' });
      return;
    }

    // Recortar el prefijo del proxy para obtener el path que Vite espera
    const prefix = `/api/experimental/preview/${id}/serve`;
    let vitePath: string = req.url;
    if (vitePath.startsWith(prefix)) vitePath = vitePath.slice(prefix.length);
    if (!vitePath || vitePath === '') vitePath = '/';
    if (!vitePath.startsWith('/')) vitePath = '/' + vitePath;

    const parsed = new URL(localUrl);
    const proxyReq = http.request(
      {
        host: '127.0.0.1',
        port: Number(parsed.port),
        path: vitePath,
        method: 'GET',
        headers: { host: `127.0.0.1:${parsed.port}` },
      },
      (proxyRes) => {
        res.status(proxyRes.statusCode || 200);
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          // Saltar headers de hop-by-hop y X-Frame-Options (lo sobreescribimos)
          if (['connection', 'transfer-encoding', 'x-frame-options'].includes(k)) continue;
          res.setHeader(k, v as string | string[]);
        }
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Access-Control-Allow-Origin', '*');
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) res.status(502).json({ error: 'Error de proxy al servidor Vite' });
    });

    proxyReq.end();
  }
}
