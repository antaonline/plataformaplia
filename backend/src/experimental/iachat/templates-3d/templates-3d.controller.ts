import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  Header,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Templates3DService } from './templates-3d.service';

@Controller('experimental/templates-3d')
export class Templates3DController {
  constructor(private readonly templates: Templates3DService) {}

  /**
   * Catalogo publico de templates 3D disponibles. Sin auth — el frontend
   * lo usa para mostrar el catalogo, y el minPlan se valida al renderizar.
   */
  @Get()
  list() {
    return { templates: this.templates.listTemplates() };
  }

  /**
   * Renderiza un template a HTML completo. Devuelve el HTML como string
   * para que el frontend lo muestre en un iframe de preview, o lo guarde
   * como pagina del proyecto del cliente.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':slug/render')
  async render(
    @Request() req: any,
    @Param('slug') slug: string,
    @Body() input: any,
  ) {
    const { html, meta } = await this.templates.render(req.user.id, slug, input);
    return { meta, html };
  }

  /**
   * Endpoint de preview directo: devuelve el HTML como text/html para que
   * se pueda cargar en un <iframe src="..."> sin parseo intermedio.
   * Util para el card del catalogo en el editor.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':slug/preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async preview(
    @Request() req: any,
    @Param('slug') slug: string,
    @Body() input: any,
  ): Promise<string> {
    const { html } = await this.templates.render(req.user.id, slug, input);
    return html;
  }
}
