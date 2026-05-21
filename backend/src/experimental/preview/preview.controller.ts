import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
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

class PreviewFilesDto {
  @IsObject()
  @IsOptional()
  files?: Record<string, string>;
}

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
