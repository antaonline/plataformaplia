import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsString, IsOptional, IsObject } from 'class-validator';

class CompileDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  filename?: string;
}

class CompileMultipleDto {
  @IsObject()
  files: Record<string, string>;
}

@Controller('experimental/sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  /**
   * POST /api/experimental/sandbox/compile
   * Compila un archivo TSX y devuelve JS listo para el iframe.
   */
  @Post('compile')
  @HttpCode(HttpStatus.OK)
  async compile(@Body() body: CompileDto) {
    return this.sandboxService.compile(body.code, body.filename || 'App.tsx');
  }

  /**
   * POST /api/experimental/sandbox/compile-multiple
   * Compila múltiples archivos a la vez.
   */
  @Post('compile-multiple')
  @HttpCode(HttpStatus.OK)
  async compileMultiple(@Body() body: CompileMultipleDto) {
    return this.sandboxService.compileMultiple(body.files);
  }

  /**
   * POST /api/experimental/sandbox/validate
   * Valida código sin compilarlo (respuesta rápida).
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() body: CompileDto) {
    return this.sandboxService.validate(body.code, body.filename || 'App.tsx');
  }
}
