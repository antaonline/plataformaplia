import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { MuapiService } from './muapi.service';
import { StudioPlansService } from '../studio-plans/studio-plans.service';

/**
 * Endpoints del entorno creativo (Muapi): generar imagen, imagen-a-video,
 * subir imagen del cliente. Todos plan-gated según las capabilities del
 * Studio (canUseFlux, canUseRunway/video, etc).
 */
@Controller('experimental/creative')
@UseGuards(JwtAuthGuard)
export class MuapiController {
  constructor(
    private readonly muapi: MuapiService,
    private readonly studioPlans: StudioPlansService,
  ) {}

  /** Catálogo de modelos disponibles + estado de configuración. */
  @Get('models')
  async models(@Request() req: any) {
    const caps = await this.studioPlans.getCapabilities(req.user.id).catch(() => null);
    return {
      configured: this.muapi.isConfigured(),
      capabilities: caps
        ? {
            canUseFlux: caps.tools.flux,
            canUseVideo: caps.tools.higsfield || caps.tools.runway || caps.tools.luma,
            planName: caps.planName,
          }
        : null,
      models: this.muapi.listModels(),
    };
  }

  /**
   * Genera una imagen con Flux. Requiere que el plan tenga canUseFlux.
   */
  @Post('generate-image')
  async generateImage(
    @Request() req: any,
    @Body()
    body: { modelId?: string; prompt: string; aspectRatio?: string },
  ) {
    const caps = await this.studioPlans.getCapabilities(req.user.id);
    if (!caps.tools.flux && !caps.tools.dalle) {
      throw new ForbiddenException(
        'Tu plan no incluye generación de imágenes con IA. Mejorá a un plan superior.',
      );
    }
    if (!body.prompt || !body.prompt.trim()) {
      throw new BadRequestException('El prompt es obligatorio');
    }
    const modelId = body.modelId || 'flux-dev';
    return this.muapi.generate({
      modelId,
      prompt: body.prompt.trim(),
      aspectRatio: body.aspectRatio || '1:1',
    });
  }

  /**
   * Convierte una imagen en video (image-to-video). Requiere que el plan
   * permita video (higsfield/runway/luma en capabilities).
   */
  @Post('image-to-video')
  async imageToVideo(
    @Request() req: any,
    @Body()
    body: {
      modelId?: string;
      imageUrl: string;
      prompt?: string;
      durationSeconds?: number;
      resolution?: string;
    },
  ) {
    const caps = await this.studioPlans.getCapabilities(req.user.id);
    const canVideo = caps.tools.higsfield || caps.tools.runway || caps.tools.luma;
    if (!canVideo) {
      throw new ForbiddenException(
        'La generación de video está disponible en planes Pro y Studio. Mejorá tu plan para desbloquearla.',
      );
    }
    if (!body.imageUrl) {
      throw new BadRequestException('Se requiere la URL de la imagen de entrada');
    }
    // Veo premium (caro): solo Studio/Agency. Veo Fast para Pro.
    const isPremiumVideo = caps.tools.luma || caps.planSlug === 'studio-agency';
    const modelId =
      body.modelId || (isPremiumVideo ? 'veo-i2v' : 'veo-fast-i2v');
    return this.muapi.generate({
      modelId,
      imageUrl: body.imageUrl,
      prompt: body.prompt,
      durationSeconds: body.durationSeconds || 5,
      resolution: body.resolution || '720p',
    });
  }

  /**
   * Sube una imagen del cliente a Muapi (para usarla como input de video).
   * Devuelve la URL presigned.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Request() req: any,
    @UploadedFile() file: any,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    const url = await this.muapi.uploadFile(
      file.buffer,
      file.originalname || 'upload.png',
    );
    if (!url) {
      throw new BadRequestException('No se pudo subir el archivo a Muapi');
    }
    return { url };
  }
}
