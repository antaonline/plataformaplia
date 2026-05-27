import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname, join } from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHostedSiteDto } from './dto/create-hosted-site.dto';
import { InstallWordPressDto } from './dto/install-wordpress.dto';
import { PrepareHostingCheckoutDto } from './dto/prepare-hosting-checkout.dto';
import { HostingService } from './hosting.service';

@Controller('hosting')
export class HostingController {
  constructor(private readonly hostingService: HostingService) {}

  @Get('public/plans')
  async publicPlans() {
    return this.hostingService.getPublicPlans();
  }

  @Post('checkout/prepare')
  async prepareCheckout(@Body() dto: PrepareHostingCheckoutDto) {
    return this.hostingService.prepareCheckout(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout/prepare-auth')
  async prepareCheckoutAuth(@Body() dto: PrepareHostingCheckoutDto, @Req() req: any) {
    return this.hostingService.prepareCheckout(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async dashboard(@Req() req: any) {
    return this.hostingService.getDashboard(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async account(@Req() req: any) {
    return this.hostingService.getDashboard(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites')
  async createSite(@Req() req: any, @Body() dto: CreateHostedSiteDto) {
    return this.hostingService.createSite(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sites/:id')
  async deleteSite(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.deleteSite(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/upload')
  @UseInterceptors(
    FilesInterceptor('files', 300, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'hosting', 'tmp');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname) || '.txt';
          cb(null, `site-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
        },
      }),
      limits: {
        files: 300,
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadSiteFiles(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<{ path: string; originalname: string }>,
    @Body() body: { paths?: string[] | string },
  ) {
    const rawPaths = Array.isArray(body?.paths)
      ? body.paths
      : typeof body?.paths === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(body.paths);
              return Array.isArray(parsed) ? parsed : [body.paths];
            } catch {
              return [body.paths];
            }
          })()
        : [];

    if (!files?.length) {
      throw new BadRequestException('No se recibieron archivos para publicar.');
    }

    return this.hostingService.uploadSiteFiles(req.user.id, id, files, rawPaths);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/renew-ssl')
  async renewSSL(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.renewSiteSSL(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/install-wordpress')
  async installWordPress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InstallWordPressDto,
  ) {
    return this.hostingService.installWordPress(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('upgrade/preview/:slug')
  async getUpgradePreview(@Req() req: any, @Param('slug') slug: string) {
    return this.hostingService.getUpgradePreview(req.user.id, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade/:slug')
  async upgradePlan(
    @Req() req: any,
    @Param('slug') slug: string,
    @Body() body: { useSavedCard?: boolean },
  ) {
    return this.hostingService.upgradePlan(req.user.id, slug, body.useSavedCard ?? true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade/:slug/confirm')
  async confirmUpgrade(
    @Req() req: any,
    @Param('slug') slug: string,
    @Body() payload: any,
  ) {
    return this.hostingService.confirmUpgrade(req.user.id, payload, slug);
  }

  // ─── Dominio propio: verificacion DNS ────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('domain/check')
  async checkDomain(@Req() req: any, @Body() body: { domain: string }) {
    if (!body?.domain) throw new BadRequestException('Falta el campo domain.');
    return this.hostingService.checkDomainDns(req.user.id, String(body.domain));
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/custom-domain')
  async createCustomDomainSite(
    @Req() req: any,
    @Body() body: { name: string; domain: string },
  ) {
    if (!body?.name || !body?.domain) {
      throw new BadRequestException('Faltan campos requeridos: name, domain.');
    }
    return this.hostingService.createCustomDomainSite(req.user.id, {
      name: String(body.name),
      domain: String(body.domain),
    });
  }

  // ─── Backups automaticos (solo Agencia) ──────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('backups')
  async listBackups(@Req() req: any) {
    return this.hostingService.listBackups(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('backups/:siteId/create-now')
  async createBackupNow(
    @Req() req: any,
    @Param('siteId', ParseIntPipe) siteId: number,
  ) {
    return this.hostingService.createBackupNow(req.user.id, siteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('backups/:siteId/download/:filename')
  async downloadBackup(
    @Req() req: any,
    @Param('siteId', ParseIntPipe) siteId: number,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filepath = await this.hostingService.resolveBackupPath(
      req.user.id,
      siteId,
      filename,
    );
    return res.download(filepath, filename);
  }

  @UseGuards(JwtAuthGuard)
  @Post('backups/:siteId/restore')
  async restoreBackup(
    @Req() req: any,
    @Param('siteId', ParseIntPipe) siteId: number,
    @Body() body: { filename: string; confirmDomain: string },
  ) {
    if (!body?.filename || !body?.confirmDomain) {
      throw new BadRequestException('Faltan campos: filename, confirmDomain.');
    }
    return this.hostingService.restoreBackup(req.user.id, siteId, {
      filename: String(body.filename),
      confirmDomain: String(body.confirmDomain),
    });
  }

  // ─── Activar emails para dominio propio ──────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('sites/:id/email-status')
  async emailStatus(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.getEmailActivationStatus(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/email/activate')
  async activateEmail(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.activateEmail(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sites/:id/email/dns')
  async emailDns(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.getEmailDnsRecords(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/email/verify')
  async verifyEmail(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.verifyEmailDns(req.user.id, id);
  }

  // ─── Subdominios extra (Premium / Agencia) ────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('sites/:id/subdomains')
  async listSubdomains(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.hostingService.listSubdomains(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sites/:id/subdomains')
  async createSubdomain(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { subdomain: string },
  ) {
    if (!body?.subdomain) {
      throw new BadRequestException('Falta el campo subdomain.');
    }
    return this.hostingService.createSubdomain(req.user.id, id, {
      subdomain: String(body.subdomain),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sites/:id/subdomains')
  async deleteSubdomain(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { domain: string },
  ) {
    if (!body?.domain) throw new BadRequestException('Falta el campo domain.');
    return this.hostingService.deleteSubdomain(req.user.id, id, String(body.domain));
  }

  // ─── Mailboxes ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('mailboxes')
  async listMailboxes(@Req() req: any) {
    return this.hostingService.listMailboxes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mailboxes')
  async createMailbox(
    @Req() req: any,
    @Body() body: { siteId: number; localPart: string; password: string },
  ) {
    if (!body?.siteId || !body?.localPart || !body?.password) {
      throw new BadRequestException(
        'Faltan campos requeridos: siteId, localPart, password.',
      );
    }
    return this.hostingService.createMailbox(req.user.id, {
      siteId: Number(body.siteId),
      localPart: String(body.localPart),
      password: String(body.password),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('mailboxes/:id')
  async deleteMailbox(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.hostingService.deleteMailbox(req.user.id, id);
  }
}
