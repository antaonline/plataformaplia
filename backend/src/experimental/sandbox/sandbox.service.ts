import { Injectable, Logger } from '@nestjs/common';
import * as esbuild from 'esbuild';

export interface CompileResult {
  js?: string;
  css?: string;
  error?: string;
  warnings?: string[];
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);

  /**
   * Compila código TSX/JSX a JavaScript puro usando esbuild.
   * Equivalente al Vite Worker de Dyad pero corriendo en NestJS.
   */
  async compile(code: string, filename: string = 'App.tsx'): Promise<CompileResult> {
    try {
      const loader = filename.endsWith('.tsx') ? 'tsx'
        : filename.endsWith('.ts') ? 'ts'
        : filename.endsWith('.jsx') ? 'jsx'
        : 'js';

      const result = await esbuild.transform(code, {
        loader,
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        target: 'es2018',
        format: 'cjs', // Cambiado a CommonJS para mejor compatibilidad con nuestro inyector
        define: {
          'process.env.NODE_ENV': '"production"',
        },
      });

      const warnings = result.warnings.map(w => w.text);

      return {
        js: result.code,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (e: any) {
      this.logger.warn(`Compile error for ${filename}: ${e.message}`);
      // Devolver el error para que el frontend pueda mostrarlo y la IA pueda auto-corregirlo
      return {
        error: e.message || 'Error de compilación desconocido',
      };
    }
  }

  /**
   * Compila múltiples archivos a la vez.
   * Usado cuando el proyecto tiene varios componentes.
   */
  async compileMultiple(files: Record<string, string>): Promise<Record<string, CompileResult>> {
    const results: Record<string, CompileResult> = {};
    await Promise.all(
      Object.entries(files).map(async ([path, code]) => {
        results[path] = await this.compile(code, path);
      })
    );
    return results;
  }

  /**
   * Valida el código sin compilarlo completamente (más rápido).
   * Equivalente al tsc worker de Dyad.
   */
  async validate(code: string, filename: string = 'App.tsx'): Promise<{ valid: boolean; errors: string[] }> {
    const result = await this.compile(code, filename);
    return {
      valid: !result.error,
      errors: result.error ? [result.error] : [],
    };
  }
}
