import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Get,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/onboarding')
  async onboarding(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.projectsService.saveOnboarding(
      id,
      {
        step: body.step ?? 1,
        data: body.data ?? body,
        completed: body.completed ?? false,
      },
    );
  }


  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@Req() req: any) {
    return this.projectsService.listByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.projectsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    if (req.user?.role === 'ADMIN') {
      return this.projectsService.findForAdmin(id);
    }

    const project = await this.projectsService.findProjectByUser(id, req.user.id);
    if (!project) {
      throw new NotFoundException('Project no encontrado.');
    }
    return project;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/diagnostics')
  async diagnostics(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.projectsService.getGenerationDiagnostics(
      id,
      req.user?.id,
      req.user?.role === 'ADMIN',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-now')
  async generateNow(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reprovision?: boolean },
    @Req() req: any,
  ) {
    return this.projectsService.runManualGeneration(
      id,
      req.user?.id,
      req.user?.role === 'ADMIN',
      body?.reprovision === true,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'logos');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname) || '.png';
          const name = `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Formato de logo no permitido.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo.');
    }

    // URL del BACKEND (donde /uploads/ realmente vive y se sirve). En produccion
    // el frontend (APP_URL) NO sirve /uploads/ — eso lo expone el backend bajo
    // PREVIEW_PROXY_BASE. Usar APP_URL aqui generaba URLs rotas (404), por lo
    // que Claude no podia descargar las imagenes del cliente al regenerar.
    const appUrl =
      (process.env.API_PUBLIC_URL && process.env.API_PUBLIC_URL.replace(/\/$/, '')) ||
      (process.env.PREVIEW_PROXY_BASE && process.env.PREVIEW_PROXY_BASE.replace(/\/$/, '')) ||
      (process.env.APP_URL && process.env.APP_URL.replace(/\/$/, '')) ||
      `${req.protocol}://${req.get('host')}`;

    const publicUrl = `${appUrl}/uploads/logos/${file.filename}`;
    return this.projectsService.saveLogo(id, req.user.id, publicUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/media')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'media');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname) || '.png';
          const name = `media-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Formato de imagen no permitido.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 3 * 1024 * 1024, files: 5 },
    }),
  )
  async uploadMedia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron imagenes.');
    }

    // URL del BACKEND (donde /uploads/ realmente vive y se sirve). En produccion
    // el frontend (APP_URL) NO sirve /uploads/ — eso lo expone el backend bajo
    // PREVIEW_PROXY_BASE. Usar APP_URL aqui generaba URLs rotas (404), por lo
    // que Claude no podia descargar las imagenes del cliente al regenerar.
    const appUrl =
      (process.env.API_PUBLIC_URL && process.env.API_PUBLIC_URL.replace(/\/$/, '')) ||
      (process.env.PREVIEW_PROXY_BASE && process.env.PREVIEW_PROXY_BASE.replace(/\/$/, '')) ||
      (process.env.APP_URL && process.env.APP_URL.replace(/\/$/, '')) ||
      `${req.protocol}://${req.get('host')}`;

    const urls = files.map((file) => `${appUrl}/uploads/media/${file.filename}`);
    return this.projectsService.saveMedia(id, req.user.id, urls);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'documents');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname) || '.pdf';
          const name = `document-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Solo se permiten archivos PDF.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body() body: { fieldKey?: string },
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo PDF.');
    }

    const fieldKey = (body?.fieldKey || '').trim();
    if (!fieldKey) {
      throw new BadRequestException('Debes indicar el campo del documento.');
    }

    // URL del BACKEND (donde /uploads/ realmente vive y se sirve). En produccion
    // el frontend (APP_URL) NO sirve /uploads/ — eso lo expone el backend bajo
    // PREVIEW_PROXY_BASE. Usar APP_URL aqui generaba URLs rotas (404), por lo
    // que Claude no podia descargar las imagenes del cliente al regenerar.
    const appUrl =
      (process.env.API_PUBLIC_URL && process.env.API_PUBLIC_URL.replace(/\/$/, '')) ||
      (process.env.PREVIEW_PROXY_BASE && process.env.PREVIEW_PROXY_BASE.replace(/\/$/, '')) ||
      (process.env.APP_URL && process.env.APP_URL.replace(/\/$/, '')) ||
      `${req.protocol}://${req.get('host')}`;

    const publicUrl = `${appUrl}/uploads/documents/${file.filename}`;
    return this.projectsService.saveDocument(id, req.user.id, fieldKey, publicUrl);
  }


  @UseGuards(JwtAuthGuard)
  @Post(':id/revisions')
  async requestRevision(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { message?: string },
    @Req() req: any,
  ) {
    const message = (body?.message || '').trim();
    if (!message) {
      throw new BadRequestException('Debes indicar los cambios.');
    }
    return this.projectsService.requestRevision(id, req.user.id, message);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.projectsService.deleteProject(
      id,
      req.user.id,
      req.user?.role === 'ADMIN',
    );
  }
}
