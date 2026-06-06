import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import {
  StudioPlansService,
  VisualComplexity,
} from './studio-plans.service';

@Controller('experimental/studio-plans')
export class StudioPlansController {
  constructor(private readonly studioPlans: StudioPlansService) {}

  /**
   * Capacidades del plan del usuario logueado.
   * El frontend lo llama al cargar el editor para saber qué mostrar/ocultar.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myCapabilities(@Request() req: any) {
    return this.studioPlans.getCapabilities(req.user.id);
  }

  /**
   * Decide qué stack de APIs usar para una generación nueva, dado el plan
   * del usuario + la intención que se detectó en el chat conversacional.
   * El frontend lo llama después del onboarding inicial, ANTES de generar.
   * Devuelve también el costo estimado para mostrarlo opcionalmente al cliente.
   */
  @UseGuards(JwtAuthGuard)
  @Post('decide-stack')
  async decideStack(
    @Request() req: any,
    @Body()
    body: {
      complexity: VisualComplexity;
      wants3D?: boolean;
      wantsVideo?: boolean;
      wantsCinematic?: boolean;
    },
  ) {
    const caps = await this.studioPlans.getCapabilities(req.user.id);
    const decision = this.studioPlans.decideStack({
      capabilities: caps,
      complexity: body.complexity,
      wants3D: body.wants3D,
      wantsVideo: body.wantsVideo,
      wantsCinematic: body.wantsCinematic,
    });
    return { capabilities: caps, decision };
  }

  /**
   * Lista pública de planes de Plia Studio. Sin auth — para la página /planes.
   */
  @Get('public')
  async publicPlans() {
    return this.studioPlans.listPublicPlans();
  }

  /**
   * SOLO ADMIN: cambia el plan Studio activo del usuario para testing.
   * El service valida que sea admin. Tras cambiarlo, getCapabilities
   * devuelve el nuevo tier y el editor refleja las herramientas del plan.
   */
  @UseGuards(JwtAuthGuard)
  @Post('dev-set-plan')
  async devSetPlan(
    @Request() req: any,
    @Body() body: { slug: string },
  ) {
    return this.studioPlans.devSetPlan(req.user.id, body.slug);
  }
}
