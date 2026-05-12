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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
  async upgradePlan(@Req() req: any, @Param('slug') slug: string) {
    return this.hostingService.upgradePlan(req.user.id, slug);
  }
}
