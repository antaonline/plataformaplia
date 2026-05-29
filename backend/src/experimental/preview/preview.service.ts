import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'net';
import { createHash } from 'crypto';
import { join } from 'path';
import * as fs from 'fs/promises';
import { scaffoldViteApp, writeGeneratedFiles } from './scaffold';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

type PreviewStatus = 'starting' | 'installing' | 'running' | 'stopped' | 'error';

interface PreviewProcess {
  process: ChildProcess | null;
  port: number;
  url: string;
  status: PreviewStatus;
  logs: string[];
  startedAt: Date;
}

export interface PreviewInfo {
  port: number | null;
  url: string | null;
  status: PreviewStatus;
  logs: string[];
}

const LOG_LIMIT = 200;
const PORT_START = Number(process.env.PREVIEW_PORT_START || 4100);
const PORT_END = Number(process.env.PREVIEW_PORT_END || 4300);

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(start: number, end: number): Promise<number> {
  for (let p = start; p <= end; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(`No hay puertos libres en el rango ${start}-${end}`);
}

async function directoryExists(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

// Firma de las dependencias del package.json (para detectar deps nuevas
// declaradas por la IA y forzar reinstalacion cuando cambian).
async function depsSignature(projectPath: string): Promise<string> {
  try {
    const pkg = JSON.parse(
      await fs.readFile(join(projectPath, 'package.json'), 'utf8'),
    );
    const deps = pkg.dependencies || {};
    const sorted = Object.keys(deps)
      .sort()
      .map((k) => `${k}@${deps[k]}`)
      .join(',');
    return createHash('sha1').update(sorted).digest('hex');
  } catch {
    return '';
  }
}

const DEPS_STAMP = '.plia-deps';

// Instalacion valida = binario de vite presente. Con el nuevo scaffold
// que symlinkea node_modules al maestro (scaffolds/plia-studio-base/
// node_modules), la presencia de node_modules/vite implica que todas las
// 60+ deps shadcn/Radix/router/query/forms/motion/recharts estan listas.
// Si la IA declaro deps NUEVAS via __deps__.json, isInstallHealthy
// devolvera false (signature distinta) y forzaremos un npm install local
// para añadirlas (raro: la lista preinstalada cubre todo).
async function isInstallHealthy(projectPath: string): Promise<boolean> {
  if (!(await directoryExists(join(projectPath, 'node_modules', 'vite')))) {
    return false;
  }
  // Si node_modules es un symlink al maestro Y la firma actual coincide
  // con la stampada, OK. Si no hay stamp, asumimos healthy (es la
  // instalacion del scaffold maestro recien copiada — la stampamos para
  // que la proxima vez sea instantaneo).
  try {
    const stamped = await fs.readFile(join(projectPath, DEPS_STAMP), 'utf8');
    return stamped.trim() === (await depsSignature(projectPath));
  } catch {
    // Sin stamp pero con node_modules/vite -> es el scaffold maestro recien
    // linkeado. Stampar y considerar healthy.
    try {
      await writeDepsStamp(projectPath);
    } catch {
      /* ignore */
    }
    return true;
  }
}

async function writeDepsStamp(projectPath: string): Promise<void> {
  try {
    await fs.writeFile(
      join(projectPath, DEPS_STAMP),
      await depsSignature(projectPath),
      'utf8',
    );
  } catch {
    /* no critico */
  }
}

// Forzamos modo desarrollo para que npm instale TODAS las dependencias,
// sin importar el NODE_ENV con el que corra el backend.
function devEnv(chatId?: number): NodeJS.ProcessEnv {
  const proxyBase = (process.env.PREVIEW_PROXY_BASE || '').replace(/\/$/, '');
  const viteProxyBase = chatId && proxyBase
    ? `${proxyBase}/api/experimental/preview/${chatId}/serve/`
    : '/';
  return {
    ...process.env,
    NODE_ENV: 'development',
    npm_config_production: 'false',
    npm_config_include: 'dev',
    npm_config_omit: '',
    // Vite usa esto como `base` para que todos los assets tengan el path del proxy
    VITE_PROXY_BASE: viteProxyBase,
  };
}

@Injectable()
export class PreviewService implements OnModuleDestroy {
  private readonly logger = new Logger(PreviewService.name);
  private processes = new Map<string, PreviewProcess>();
  private installing = new Map<string, Promise<void>>();

  private projectPath(chatId: number | string): string {
    return join(process.cwd(), 'uploads', 'studio-live', String(chatId));
  }

  private appendLog(pp: PreviewProcess, chunk: Buffer | string) {
    chunk
      .toString()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length)
      .forEach((line) => {
        pp.logs.push(line);
        if (pp.logs.length > LOG_LIMIT) pp.logs.shift();
      });
  }

  /**
   * Escribe el scaffold + archivos generados. Si el server ya corre, Vite
   * aplica HMR automaticamente al detectar los cambios en disco.
   */
  async sync(
    chatId: number,
    files: Record<string, string>,
  ): Promise<PreviewInfo> {
    const projectPath = this.projectPath(chatId);
    await fs.mkdir(projectPath, { recursive: true });
    await scaffoldViteApp(projectPath);
    await writeGeneratedFiles(projectPath, files);
    return this.getStatus(chatId);
  }

  private async ensureInstalled(
    chatId: number,
    projectPath: string,
    pp: PreviewProcess,
  ): Promise<void> {
    if (await isInstallHealthy(projectPath)) return;

    const key = String(chatId);
    const existing = this.installing.get(key);
    if (existing) {
      this.appendLog(pp, '[PLIA] Instalacion de dependencias en curso, esperando...');
      await existing;
      return;
    }

    const installPromise = (async () => {
      try {
        if (await isInstallHealthy(projectPath)) return;
        pp.status = 'installing';
        this.appendLog(pp, '[PLIA] Instalando dependencias (npm install)...');
        await new Promise<void>((resolve, reject) => {
          const child = spawn(npmCommand, ['install', '--no-audit', '--no-fund'], {
            cwd: projectPath,
            env: devEnv(),
            shell: process.platform === 'win32',
            stdio: ['ignore', 'pipe', 'pipe'],
          });
          child.stdout?.on('data', (c) => this.appendLog(pp, c));
          child.stderr?.on('data', (c) => this.appendLog(pp, c));
          child.on('error', reject);
          child.on('close', (code) =>
            code === 0
              ? resolve()
              : reject(new Error(`npm install salio con codigo ${code}`)),
          );
        });
        await writeDepsStamp(projectPath);
        this.appendLog(pp, '[PLIA] Dependencias instaladas.');
      } finally {
        this.installing.delete(key);
      }
    })();

    this.installing.set(key, installPromise);
    await installPromise;
  }

  private async waitForReady(url: string, pp: PreviewProcess): Promise<void> {
    const timeoutMs = 60_000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch(url, { method: 'GET' });
        if (res.ok || res.status === 304) {
          this.appendLog(pp, '[PLIA] Servidor de preview listo.');
          return;
        }
      } catch {
        /* aun no responde */
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    this.appendLog(pp, '[PLIA] El servidor no respondio a tiempo; continuando igual.');
  }

  async start(
    chatId: number,
    files: Record<string, string>,
  ): Promise<PreviewInfo> {
    const key = String(chatId);
    const existing = this.processes.get(key);
    if (existing && existing.status !== 'error' && existing.status !== 'stopped') {
      // Ya corriendo: solo re-sincronizamos archivos (HMR).
      await this.sync(chatId, files);
      return this.toInfo(existing);
    }

    const projectPath = this.projectPath(chatId);
    await fs.mkdir(projectPath, { recursive: true });
    await scaffoldViteApp(projectPath);
    await writeGeneratedFiles(projectPath, files);

    const port = await findAvailablePort(PORT_START, PORT_END);
    // La URL publica pasa por el proxy NestJS (GET /experimental/preview/:id/serve/*).
    // PREVIEW_PROXY_BASE debe ser la URL base del API publica, ej: https://api.plia.pe
    const proxyBase = (process.env.PREVIEW_PROXY_BASE || '').replace(/\/$/, '');
    const url = proxyBase
      ? `${proxyBase}/api/experimental/preview/${chatId}/serve/`
      : `http://127.0.0.1:${port}`; // fallback local (dev)

    const pp: PreviewProcess = {
      process: null,
      port,
      url,
      status: 'starting',
      logs: [],
      startedAt: new Date(),
    };
    this.processes.set(key, pp);

    try {
      await this.ensureInstalled(chatId, projectPath, pp);
    } catch (e: any) {
      pp.status = 'error';
      this.appendLog(pp, `[PLIA] Error instalando dependencias: ${e.message}`);
      return this.toInfo(pp);
    }

    pp.status = 'starting';
    this.appendLog(pp, `[PLIA] Iniciando servidor Vite en el puerto ${port}...`);

    const child = spawn(
      npmCommand,
      ['run', 'dev', '--', '--port', String(port), '--host', '127.0.0.1', '--strictPort'],
      {
        cwd: projectPath,
        env: devEnv(chatId),
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    pp.process = child;

    child.stdout?.on('data', (c) => {
      this.appendLog(pp, c);
      if (pp.status === 'starting' || pp.status === 'installing') {
        pp.status = 'running';
      }
    });
    child.stderr?.on('data', (c) => this.appendLog(pp, c));

    child.on('exit', (code, signal) => {
      pp.status = code === 0 ? 'stopped' : 'error';
      this.appendLog(
        pp,
        `[PLIA] Proceso de preview finalizado (code: ${code ?? 'null'}, signal: ${signal ?? 'null'})`,
      );
      this.processes.delete(key);
    });
    child.on('error', (err) => {
      pp.status = 'error';
      this.appendLog(pp, `[PLIA] Fallo el proceso de preview: ${err.message}`);
    });

    await this.waitForReady(url, pp);
    if (pp.status === 'starting') pp.status = 'running';

    return this.toInfo(pp);
  }

  async stop(chatId: number): Promise<PreviewInfo> {
    const key = String(chatId);
    const pp = this.processes.get(key);
    if (!pp) {
      return { port: null, url: null, status: 'stopped', logs: [] };
    }
    try {
      pp.process?.kill('SIGTERM');
    } catch (e: any) {
      this.logger.error(`No se pudo detener el preview ${key}: ${e.message}`);
    }
    this.processes.delete(key);
    return { port: null, url: null, status: 'stopped', logs: pp.logs };
  }

  getStatus(chatId: number): PreviewInfo {
    const pp = this.processes.get(String(chatId));
    if (!pp) return { port: null, url: null, status: 'stopped', logs: [] };
    return this.toInfo(pp);
  }

  /** URL interna de Vite para el proxy (siempre localhost, sin importar PREVIEW_PROXY_BASE). */
  getLocalUrl(chatId: number): string | null {
    const pp = this.processes.get(String(chatId));
    if (!pp || pp.status === 'stopped' || pp.status === 'error') return null;
    return `http://127.0.0.1:${pp.port}`;
  }

  private toInfo(pp: PreviewProcess): PreviewInfo {
    return {
      port: pp.port,
      url: pp.url,
      status: pp.status,
      logs: [...pp.logs],
    };
  }

  onModuleDestroy() {
    for (const [, pp] of this.processes) {
      try {
        pp.process?.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    }
    this.processes.clear();
  }
}
