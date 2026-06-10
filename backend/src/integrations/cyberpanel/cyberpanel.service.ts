import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { execFile, execFileSync } from 'child_process';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import * as fs from 'fs';
import https from 'https';
import * as path from 'path';
import { promisify } from 'util';
import { PrismaService } from '../../prisma/prisma.service';

const execFileAsync = promisify(execFile);

export type StoredCyberpanelAccount = {
  username: string;
  email: string;
  panelUrl: string;
  ownerType: 'customer' | 'shared-admin';
  createdAt: string;
  sourceProjectId?: number;
  sourceLabel?: string;
  encryptedPassword?: string;
};

export type EnsureSiteResult = {
  domain: string | null;
  createdWebsite: boolean;
  accountCreated: boolean;
  account?: StoredCyberpanelAccount;
  plainPassword?: string;
};

type CustomerAccountProvision = {
  account: StoredCyberpanelAccount;
  accountCreated: boolean;
  plainPassword?: string;
};

@Injectable()
export class CyberpanelService {
  private readonly logger = new Logger(CyberpanelService.name);

  constructor(private prisma: PrismaService) {}

  private get baseUrl() {
    const raw = (process.env.CYBERPANEL_API_URL || '').trim();
    if (!raw) return '';
    
    // Limpiamos la URL de posibles sufijos /api o slashes
    let clean = raw.replace(/\/api\/?$/, '').replace(/\/$/, '');

    // Si ya incluye un puerto (indicado por dos puntos después del protocolo), lo devolvemos tal cual
    const hasPort = clean.split('://')[1]?.includes(':');
    if (hasPort) {
      return clean;
    }

    const port = process.env.CYBERPANEL_API_PORT;
    if (port) {
      return `${clean}:${port}`;
    }
    return clean;
  }

  private get createPath() {
    return process.env.CYBERPANEL_API_CREATE_PATH || '/api/createWebsite';
  }

  private get createUserPath() {
    return process.env.CYBERPANEL_API_CREATE_USER_PATH || '/api/submitUserCreation';
  }

  private get deletePath() {
    return process.env.CYBERPANEL_API_DELETE_PATH || '/api/deleteWebsite';
  }

  private get deleteUserPath() {
    return process.env.CYBERPANEL_API_DELETE_USER_PATH || '/api/submitUserDeletion';
  }

  private get changePackagePath() {
    return process.env.CYBERPANEL_API_CHANGE_PACKAGE_PATH || '/api/changePackage';
  }

  private get installWPPath() {
    // Usamos el endpoint exacto del Quick App Installer (apartado individual del website)
    return '/websites/installWordpress';
  }

  private get panelUrl() {
    let raw = (process.env.CYBERPANEL_PANEL_URL || this.baseUrl || '').trim();
    // Repara typos comunes en ecosystem.config.js:
    //   "https=//host" o "https=host" -> "https://host"
    raw = raw.replace(/^(https?)=\/\//, '$1://').replace(/^(https?)=/, '$1://');
    // Si quedo sin protocolo, asumimos https
    if (!/^https?:\/\//.test(raw)) raw = `https://${raw}`;
    return raw.replace(/\/?$/, '/');
  }

  private get credentialsSecret() {
    const secret = process.env.CYBERPANEL_CREDENTIALS_KEY || process.env.JWT_SECRET || '';
    if (!secret) {
      throw new Error(
        'Missing CYBERPANEL_CREDENTIALS_KEY or JWT_SECRET for CyberPanel credential encryption.',
      );
    }
    return createHash('sha256').update(secret).digest();
  }

  private get headers() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // CloudAPI prefiere Basic Auth
    const adminUser = process.env.CYBERPANEL_ADMIN_USER;
    const adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    if (adminUser && adminPass) {
      const token = Buffer.from(`${adminUser}:${adminPass}`).toString('base64');
      headers.Authorization = `Basic ${token}`;
    } else if (process.env.CYBERPANEL_API_KEY) {
      headers.Authorization = process.env.CYBERPANEL_API_KEY;
    }
    
    return headers;
  }

  private get httpsAgent() {
    const allowInsecure = process.env.CYBERPANEL_ALLOW_INSECURE === 'true';
    if (!allowInsecure) return undefined;
    return new https.Agent({ rejectUnauthorized: false });
  }

  private normalizePhpSelection(value?: string) {
    const raw = (value || '').trim();
    if (!raw) return 'PHP 8.2';
    return /^php\s+/i.test(raw) ? raw : `PHP ${raw}`;
  }

  private isSuccessResponse(data: any) {
    // BUG ANTERIOR: si data era null/string/HTML (p.ej. pagina de login por
    // cred caducada) devolvia true -> el sistema creia que CyberPanel habia
    // creado el sitio aunque NO lo creara. Ahora exigimos un JSON con un
    // marcador explicito de exito.
    if (!data) return false;
    if (typeof data === 'string') {
      // CyberPanel a veces responde JSON-en-string ("{...}"); intentar parsear.
      const trimmed = data.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          return this.isSuccessResponse(JSON.parse(trimmed));
        } catch {
          /* no es JSON valido, cae a falso */
        }
      }
      return false; // HTML/login/cadena = NO exito
    }
    if (typeof data !== 'object') return false;
    const candidates = [
      data.status,
      data.createWebSiteStatus,
      data.createWebsiteStatus,
      data.websiteDeleteStatus,
      data.deleteWebSiteStatus,
      data.deleteWebsiteStatus,
      data.deleteStatus,
      data.submitUserDeletion,
      data.fetchStatus,
      data.success,
      data.installStatus,
      data.wpInstallStatus,
      data.submitWPInstall,
      data.submitWPInstallStatus,
    ];
    return candidates.some((value) => value === 1 || value === '1' || value === true || (typeof value === 'string' && value.toLowerCase() === 'success'));
  }

  private extractErrorMessage(data: any) {
    if (!data) return 'Unknown error';
    if (typeof data === 'string') return data;
    return (
      data.error_message ||
      data.errorMessage ||
      data.message ||
      data.error ||
      data.status_message ||
      JSON.stringify(data)
    );
  }

  private isAlreadyExistsMessage(message: string) {
    return /(already exists|exists already|duplicate|taken|is not unique)/i.test(message);
  }

  private async request(path: string, body: Record<string, any>, timeout = 60000, authContext?: { cookie: string, csrfToken?: string }) {
    const url = `${this.baseUrl}${path}`;
    this.logger.log(
      `CyberPanel request ${path} adminUser=${body.adminUser || 'missing'} hasAdminPass=${Boolean(body.adminPass)}`,
    );
    try {
      const reqHeaders = { ...this.headers };
      if (authContext) {
        reqHeaders['Cookie'] = authContext.cookie;
        if (authContext.csrfToken) {
          reqHeaders['X-CSRFToken'] = authContext.csrfToken;
          reqHeaders['Referer'] = `${this.baseUrl}/`;
        }
      }
      
      const res = await axios.post(url, body, {
        headers: reqHeaders,
        httpsAgent: this.httpsAgent,
        timeout,
      });
      // Log del cuerpo de respuesta SIEMPRE (truncado). Antes esto quedaba
      // oculto -> respuestas como HTML de login pasaban como "exito" mudo.
      const bodyPreview =
        typeof res.data === 'string'
          ? res.data.slice(0, 400)
          : JSON.stringify(res.data || {}).slice(0, 400);
      this.logger.log(
        `CyberPanel response ${path} status=${res.status} body=${bodyPreview}`,
      );
      if (!this.isSuccessResponse(res.data)) {
        throw new BadRequestException(this.extractErrorMessage(res.data));
      }
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const responseData = error?.response?.data;
      const message = this.extractErrorMessage(responseData || error?.message || error);

      if (error.code === 'ECONNABORTED') {
        throw new BadRequestException('La operacion en CyberPanel tardo demasiado. Es posible que continue en segundo plano, por favor espera un momento y recarga.');
      }

      if (status === 404) {
        throw new BadRequestException(
          `CyberPanel devolvio 404 al llamar ${url}. Revisa CYBERPANEL_API_URL, puerto y la ruta configurada.`,
        );
      }
      if (status === 401 || status === 403) {
        throw new BadRequestException(
          `CyberPanel rechazo la autenticacion al llamar ${url}. Revisa CYBERPANEL_ADMIN_USER, CYBERPANEL_ADMIN_PASS y/o CYBERPANEL_API_KEY.`,
        );
      }
      throw new BadRequestException(`CyberPanel error en ${url}: ${message}`);
    }
  }

  private async getAuthCookie(): Promise<{ cookie: string, csrfToken?: string } | undefined> {
    const adminUser = process.env.CYBERPANEL_ADMIN_USER;
    const adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    if (!adminUser || !adminPass) return undefined;

    try {
      // 1. Obtener csrftoken inicial
      const r1 = await axios.get(`${this.baseUrl}/`, {
        httpsAgent: this.httpsAgent,
      });
      const cookies1 = r1.headers['set-cookie'] || [];
      const csrfCookieRaw = cookies1.find(c => c.startsWith('csrftoken=')) || '';
      const csrfCookie = csrfCookieRaw.split(';')[0];
      const csrfToken = csrfCookie.split('=')[1];

      if (!csrfToken) return undefined;

      // 2. Hacer login para obtener sessionid (CyberPanel hace un redirect 302 si es exitoso)
      const data = new URLSearchParams();
      data.append('username', adminUser);
      data.append('password', adminPass);

      let sessionIdCookie = '';
      try {
        await axios.post(`${this.baseUrl}/api/loginAPI`, data.toString(), {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': csrfCookie,
            'X-CSRFToken': csrfToken,
            'Referer': `${this.baseUrl}/`
          },
          httpsAgent: this.httpsAgent,
          maxRedirects: 0,
        });
      } catch (e: any) {
        if (e.response && e.response.status === 302) {
          const cookies2 = e.response.headers['set-cookie'] || [];
          const sessionRaw = cookies2.find((c: string) => c.startsWith('sessionid=')) || '';
          sessionIdCookie = sessionRaw.split(';')[0];
        } else {
          throw e;
        }
      }

      if (!sessionIdCookie) return undefined;

      return { cookie: `${csrfCookie}; ${sessionIdCookie}`, csrfToken };
    } catch (error) {
      this.logger.warn('No se pudo obtener la cookie de sesion de CyberPanel', error);
    }
    return undefined;
  }

  private buildSharedAdminAccount(sourceLabel?: string): StoredCyberpanelAccount {
    return {
      username: process.env.CYBERPANEL_OWNER || process.env.CYBERPANEL_ADMIN_USER || 'admin',
      email: process.env.CYBERPANEL_DEFAULT_EMAIL || 'admin@plia.pe',
      panelUrl: this.panelUrl,
      ownerType: 'shared-admin',
      createdAt: new Date().toISOString(),
      sourceLabel,
    };
  }

  private shouldFallbackToSharedAdmin() {
    return process.env.CYBERPANEL_SHARED_OWNER_FALLBACK !== 'false';
  }

  private buildStrongPassword(length = 16) {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const all = `${uppercase}${lowercase}${digits}`;
    let value =
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      digits[Math.floor(Math.random() * digits.length)];
    while (value.length < length) {
      value += all[Math.floor(Math.random() * all.length)];
    }
    return value
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private encryptSecret(value: string) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.credentialsSecret, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decryptSecret(value?: string) {
    if (!value) return undefined;
    const [ivHex, payloadHex] = value.split(':');
    if (!ivHex || !payloadHex) return undefined;
    const decipher = createDecipheriv(
      'aes-256-cbc',
      this.credentialsSecret,
      Buffer.from(ivHex, 'hex'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payloadHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private splitName(value: string) {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: 'Cliente', lastName: 'PLIA' };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: 'PLIA' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  private normalizeSubdomain(value: string, baseDomain?: string) {
    let raw = (value || '').trim().toLowerCase();
    const suffix = (baseDomain || process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe')
      .trim()
      .toLowerCase();

    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (suffix && raw.endsWith(`.${suffix}`)) {
      raw = raw.slice(0, -(`.${suffix}`.length));
    }

    const cleaned = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
    if (!cleaned) return '';
    if (cleaned.length < 3) return '';
    return cleaned.slice(0, 30);
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  private buildWebsiteRequest(
    domain: string,
    account: StoredCyberpanelAccount,
    ownerPassword: string,
    packageName?: string,
  ) {
    if (!ownerPassword) {
      throw new Error(
        `Missing owner password for CyberPanel user ${account.username}. Set CYBERPANEL_EXISTING_USER_PASSWORD or recreate the account.`,
      );
    }

    const resolvedPackageName = packageName || process.env.CYBERPANEL_PACKAGE || 'Default';
    const phpSelection = this.normalizePhpSelection(
      process.env.CYBERPANEL_PHP_SELECTION || process.env.CYBERPANEL_PHP,
    );
    const body: Record<string, any> = {
      domainName: domain,
      email: account.email,
      ownerEmail: account.email,
      owner: account.username,
      websiteOwner: account.username,
      ownerPassword,
      phpSelection,
      packageName: resolvedPackageName,
      ssl: 1,
      dkIMCheck: 0,
      openBasedir: 1,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    return {
      path: this.createPath,
      type: 'website',
      body,
    };
  }

  private buildCustomerUsername(userId: number, name?: string, email?: string) {
    const source = name || email?.split('@')[0] || `cliente${userId}`;
    const slug = this.slugify(source).replace(/-/g, '') || 'cliente';
    return `pl${userId}${slug}`.slice(0, 16);
  }

  private async findStoredAccount(userId: number): Promise<StoredCyberpanelAccount | null> {
    const hostingAccount = await this.prisma.hostingAccount.findUnique({
      where: { userId },
    });

    if (hostingAccount?.cyberpanelUsername && hostingAccount?.panelUrl) {
      return {
        username: hostingAccount.cyberpanelUsername,
        email: hostingAccount.email,
        panelUrl: hostingAccount.panelUrl,
        ownerType: 'customer',
        createdAt: hostingAccount.createdAt.toISOString(),
        encryptedPassword: hostingAccount.encryptedPassword ?? undefined,
      };
    }

    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        onboardingData: true,
      },
    });

    for (const project of projects) {
      const parsed = JSON.parse((project.onboardingData as string) || '{}');
      const account = parsed?.cyberpanel?.account;
      // Ignorar cuentas tipo "shared-admin" (legacy del shortcut
      // CYBERPANEL_OWNER=admin). Solo nos interesan cuentas reales
      // pl<id><slug> que representan al usuario PLIA en CyberPanel.
      // Asi un usuario con sitios viejos bajo admin + un sitio nuevo
      // bajo su cuenta real, retorna la real cuando crea un proyecto mas.
      if (
        account?.username &&
        account?.panelUrl &&
        account.ownerType !== 'shared-admin'
      ) {
        return account as StoredCyberpanelAccount;
      }
    }

    return null;
  }

  revealStoredPassword(value?: string) {
    return this.decryptSecret(value);
  }

  async ensureHostingAccountForUser(
    user: { id: number; name?: string; email?: string },
    options: { packageName: string; maxSites: number; sourceLabel?: string },
  ): Promise<CustomerAccountProvision> {
    const existing = await this.findStoredAccount(user.id);
    if (existing) {
      return {
        account: existing,
        accountCreated: false,
        plainPassword:
          this.decryptSecret(existing.encryptedPassword) ||
          process.env.CYBERPANEL_EXISTING_USER_PASSWORD,
      };
    }

    const username = this.buildCustomerUsername(user.id, user?.name, user?.email);
    const password = this.buildStrongPassword();
    const email = user?.email || process.env.CYBERPANEL_DEFAULT_EMAIL || 'admin@plia.pe';
    const { firstName, lastName } = this.splitName(user?.name || '');
    const websitesLimit = Number(options.maxSites || process.env.CYBERPANEL_USER_WEBSITES_LIMIT || 100);
    const selectedACL = process.env.CYBERPANEL_USER_ACL || 'user';
    const securityLevel = process.env.CYBERPANEL_USER_SECURITY_LEVEL || 'HIGH';

    const body: Record<string, any> = {
      firstName,
      lastName,
      email,
      userName: username,
      password,
      packageName: options.packageName,
      websitesLimit,
      selectedACL,
      securityLevel,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    let accountCreated = true;

    try {
      await this.request(this.createUserPath, body);
    } catch (error: any) {
      const message = this.extractErrorMessage(error?.response?.data || error?.message || error);
      if (
        this.shouldFallbackToSharedAdmin() &&
        /404|submitUserCreation|ruta configurada/i.test(message)
      ) {
        this.logger.warn(
          `CyberPanel createUser no disponible. Usando owner compartido administrado por PLIA para ${username}.`,
        );
        return {
          account: this.buildSharedAdminAccount(options.sourceLabel),
          accountCreated: false,
          plainPassword: undefined,
        };
      }
      if (!this.isAlreadyExistsMessage(message)) {
        throw error;
      }
      accountCreated = false;
      this.logger.warn(`CyberPanel createUser reutilizando ${username}: ${message}`);
    }

    return {
      account: {
        username,
        email,
        panelUrl: this.panelUrl,
        ownerType: 'customer',
        createdAt: new Date().toISOString(),
        sourceLabel: options.sourceLabel,
        encryptedPassword: this.encryptSecret(password),
      },
      accountCreated,
      plainPassword: accountCreated ? password : undefined,
    };
  }

  async createSiteForAccount(
    domain: string,
    account: StoredCyberpanelAccount,
    ownerPassword: string,
    packageName?: string,
  ) {
    const siteRequest = this.buildWebsiteRequest(domain, account, ownerPassword, packageName);
    this.logger.log(
      `CyberPanel provisioning ${siteRequest.type} for ${domain} via ${siteRequest.path}`,
    );
    return this.request(siteRequest.path, siteRequest.body);
  }

  async deleteSiteByDomain(domain: string) {
    if (!domain) {
      return true;
    }

    const body: Record<string, any> = {
      domainName: domain,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    try {
      await this.request(this.deletePath, body);
      return true;
    } catch (error: any) {
      this.logger.error(`CyberPanel delete error for ${domain}`, error?.message || error);
      return false;
    }
  }

  private async ensureCustomerAccount(project: any): Promise<CustomerAccountProvision> {
    // Si CYBERPANEL_OWNER está seteado, usamos esa cuenta directamente como
    // owner de todos los sitios (evita límites de paquetes por-usuario).
    if (process.env.CYBERPANEL_OWNER) {
      return {
        account: this.buildSharedAdminAccount(`project-${project.id}`),
        accountCreated: false,
        plainPassword: process.env.CYBERPANEL_ADMIN_PASS,
      };
    }

    return this.ensureHostingAccountForUser(
      {
        id: project.userId,
        name: project.user?.name,
        email: project.user?.email,
      },
      {
        packageName: process.env.CYBERPANEL_PACKAGE || 'Default',
        maxSites: Number(process.env.CYBERPANEL_USER_WEBSITES_LIMIT || 100),
        sourceLabel: `project-${project.id}`,
      },
    );
  }

  async ensureSite(projectId: number): Promise<EnsureSiteResult> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });
    if (!project) {
      return {
        domain: null,
        createdWebsite: false,
        accountCreated: false,
      };
    }
    const data = JSON.parse((project.onboardingData as string) || '{}');
    const currentAccount = data.cyberpanel?.account as StoredCyberpanelAccount | undefined;
    if (data.publicDomain) {
      return {
        domain: data.publicDomain,
        createdWebsite: false,
        accountCreated: false,
        account: currentAccount,
      };
    }

    const baseDomain = process.env.CYBERPANEL_DOMAIN_BASE || 'plia.pe';
    const preferred = this.normalizeSubdomain(data.subdomain || '', baseDomain);
    if (!preferred) {
      this.logger.warn(
        `CyberPanel invalid subdomain for project=${projectId} raw=${JSON.stringify(
          data.subdomain ?? null,
        )} onboardingKeys=${Object.keys(data || {}).join(',')}`,
      );
      throw new BadRequestException(
        'El subdominio enviado no es valido o no se guardo correctamente. Debe tener al menos 3 caracteres y solo usar letras, numeros o guiones.',
      );
    }
    let domain = `${preferred}.${baseDomain}`;
    const existing = await this.prisma.project.findFirst({
      where: { onboardingData: { contains: `"publicDomain":"${domain}"` } },
    });
    if (existing) {
      throw new BadRequestException('El subdominio elegido ya esta en uso. Elige otro.');
    }
    this.logger.log(
      `ensureSite project=${projectId} domain=${domain}: garantizando cuenta CyberPanel...`,
    );
    let accountProvision;
    try {
      accountProvision = await this.ensureCustomerAccount(project);
    } catch (error: any) {
      // Antes esto se propagaba sin persistir nada -> proyecto quedaba "En
      // progreso" mudo. Ahora lo registramos como cyberpanel:FAILED y
      // devolvemos domain:null para que el llamador marque aiGeneration FAILED.
      const responseData = error?.response?.data;
      const message = this.extractErrorMessage(
        responseData || error?.message || error,
      );
      this.logger.error(
        `ensureSite project=${projectId} fallo en ensureCustomerAccount: ${message}`,
      );
      if (responseData) {
        this.logger.error(
          `CyberPanel response: ${JSON.stringify(responseData)}`,
        );
      }
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...data,
            cyberpanel: {
              status: 'FAILED',
              stage: 'ensureCustomerAccount',
              requestedDomain: domain,
              error: responseData || error?.message || 'Unknown error',
              createdAt: new Date().toISOString(),
            },
          }),
        },
      });
      return {
        domain: null,
        createdWebsite: false,
        accountCreated: false,
      };
    }
    const account = accountProvision.account;
    const ownerPassword =
      accountProvision.plainPassword ||
      process.env.CYBERPANEL_EXISTING_USER_PASSWORD ||
      '';
    // FREEMIUM: las webs en prueba arrancan con el paquete limitado admin_free.
    // Al pagar, activateTrialForUser hace changePackage al paquete pago (Default).
    const trialPackage = (project as any).isTrial
      ? (process.env.CYBERPANEL_PACKAGE_FREE || 'admin_free')
      : undefined;
    const siteRequest = this.buildWebsiteRequest(domain, account, ownerPassword, trialPackage);
    try {
      const response = await this.createSiteForAccount(domain, account, ownerPassword, trialPackage);
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...data,
            publicDomain: domain,
            publicUrl: `https://${domain}`,
            cyberpanel: {
              status: 'CREATED',
              siteType: siteRequest.type,
              requestedPath: siteRequest.path,
              response,
              owner: account.username,
              account,
              createdAt: new Date().toISOString(),
            },
          }),
        },
      });
      return {
        domain,
        createdWebsite: true,
        accountCreated: accountProvision.accountCreated,
        account,
        plainPassword: accountProvision.plainPassword,
      };
    } catch (error: any) {
      const responseData = error?.response?.data;
      const message = this.extractErrorMessage(responseData || error?.message || error);
      this.logger.error(
        `CyberPanel ${siteRequest.type} fallo para ${domain} via ${siteRequest.path}: ${message}`,
      );
      if (responseData) {
        this.logger.error(`CyberPanel response: ${JSON.stringify(responseData)}`);
      }
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...data,
            cyberpanel: {
              status: 'FAILED',
              siteType: siteRequest.type,
              requestedPath: siteRequest.path,
              owner: account.username,
              account,
              requestedDomain: domain,
              error: responseData || error?.message || 'Unknown error',
              createdAt: new Date().toISOString(),
            },
          }),
        },
      });
      return {
        domain: null,
        createdWebsite: false,
        accountCreated: accountProvision.accountCreated,
        account,
        plainPassword: accountProvision.plainPassword,
      };
    }
  }

  async deleteSiteByProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      this.logger.warn(`CyberPanel delete skipped: project ${projectId} not found`);
      return true;
    }
    const data = JSON.parse((project.onboardingData as string) || '{}');
    const domain = data.publicDomain;
    if (!domain) {
      this.logger.log(`CyberPanel delete skipped: project ${projectId} has no publicDomain`);
      return true;
    }

    try {
      const deleted = await this.deleteSiteByDomain(domain);
      if (!deleted) {
        throw new Error('CyberPanel no pudo eliminar el dominio.');
      }
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: JSON.stringify({
            ...data,
            cyberpanel: {
              ...(data.cyberpanel || {}),
              deletedAt: new Date().toISOString(),
            },
          }),
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error('CyberPanel delete error', error?.message || error);
      return false;
    }
  }

  async deleteUserByUsername(username: string) {
    if (!username) return false;

    const body: Record<string, any> = {
      accountUsername: username,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    try {
      await this.request(this.deleteUserPath, body);
      return true;
    } catch (error: any) {
      this.logger.error(
        `CyberPanel delete user error for ${username}`,
        error?.message || error,
      );
      return false;
    }
  }

  async installWordPress(options: {
    domainName: string;
    blogTitle: string;
    wpUser: string;
    wpPass: string;
    wpEmail: string;
    websiteOwner: string;
    installPath?: string;
  }) {
    const body: Record<string, any> = {
      domain: options.domainName,
      blogTitle: options.blogTitle,
      adminUser: options.wpUser,
      passwordByPass: options.wpPass,
      adminEmail: options.wpEmail,
      home: options.installPath ? '0' : '1',
      path: options.installPath || '',
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUserHeader = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPassHeader = process.env.CYBERPANEL_ADMIN_PASS;
      // CyberPanel general API interceptor uses adminUser and adminPass keys for auth,
      // but since WP install form also uses 'adminUser' / 'adminPass' for the WP login credentials,
      // we must send them safely. The CyberPanel basic auth header is used for actual auth anyway.
      // However, if basic auth fails, we should be careful. 
      // The headers getter in this service already sets Basic Auth.
    }

    // Obtenemos una cookie de sesion real porque este endpoint interno (/websites/installWordpress)
    // requiere que haya un request.session válido.
    const authContext = await this.getAuthCookie();

    // Aumentamos el timeout para WordPress ya que es una operacion pesada (2 minutos)
    return this.request(this.installWPPath, body, 120000, authContext);
  }

  public async deleteDatabase(dbName: string) {
    const authContext = await this.getAuthCookie();
    const res = await this.request('/dataBases/submitDatabaseDeletion', { dbName }, 60000, authContext);
    
    if (res.data?.status === 0 || res.data?.deleteStatus === 0) {
      throw new Error(res.data.error_message || 'Error al eliminar base de datos');
    }
    return true;
  }

  private resolveCyberpanelDbPassword(): string | null {
    // Prioridad 1: env var explicita
    const fromEnv = process.env.CYBERPANEL_DB_PASSWORD;
    if (fromEnv) return fromEnv;

    // Prioridad 2: archivo estandar de CyberPanel (root user puede leerlo)
    try {
      if (fs.existsSync('/etc/cyberpanel/mysqlPassword')) {
        const value = fs.readFileSync('/etc/cyberpanel/mysqlPassword', 'utf8').trim();
        if (value) return value;
      }
    } catch {
      // sin permisos para leer
    }

    // Prioridad 3: en este servidor coinciden con ADMIN_PASS
    return process.env.CYBERPANEL_ADMIN_PASS || null;
  }

  /**
   * Lista los sitios pertenecientes a un usuario CyberPanel.
   *
   * CyberPanel guarda sus sitios en su propia base MySQL local
   * (`cyberpanel` DB, tabla `websiteFunctions_websites`) con FK a
   * `loginSystem_administrator(userName)`. Lo consultamos directamente
   * con el CLI `mysql` (ya instalado en el server) usando MYSQL_PWD para
   * no exponer la password en argv. Es 100% confiable y no depende de
   * las APIs HTTP de CyberPanel (que en esta version devuelven HTML).
   */
  async listSitesForOwner(
    ownerUsername: string,
  ): Promise<Array<{ domain: string; admin: string; state?: string; adminEmail?: string }>> {
    if (!ownerUsername) return [];

    // Hardening contra SQL injection: el username CyberPanel siempre es
    // alfanumerico (pl<id><slug>), pero validamos por si acaso.
    if (!/^[A-Za-z0-9_-]+$/.test(ownerUsername)) {
      this.logger.warn(
        `listSitesForOwner: ownerUsername invalido "${ownerUsername}"`,
      );
      return [];
    }

    const password = this.resolveCyberpanelDbPassword();
    if (!password) {
      this.logger.warn(
        `listSitesForOwner(${ownerUsername}): no se pudo obtener password MySQL de CyberPanel (define CYBERPANEL_DB_PASSWORD o CYBERPANEL_ADMIN_PASS, o asegura /etc/cyberpanel/mysqlPassword)`,
      );
      return [];
    }

    const dbUser = process.env.CYBERPANEL_DB_USER || 'root';
    const dbName = process.env.CYBERPANEL_DB_NAME || 'cyberpanel';
    const sql =
      `SELECT w.domain, w.adminEmail, w.state ` +
      `FROM websiteFunctions_websites w ` +
      `JOIN loginSystem_administrator a ON w.admin_id = a.id ` +
      `WHERE a.userName = '${ownerUsername}'`;

    try {
      const output = execFileSync(
        'mysql',
        [`-u${dbUser}`, '-N', '-B', dbName, '-e', sql],
        {
          env: { ...process.env, MYSQL_PWD: password },
          timeout: 10000,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
      const matched = lines
        .map((line) => {
          const cols = line.split('\t');
          return {
            domain: (cols[0] || '').trim(),
            admin: ownerUsername,
            adminEmail: (cols[1] || '').trim() || undefined,
            state: (cols[2] || '').trim() || undefined,
          };
        })
        .filter((r) => r.domain);

      this.logger.log(
        `listSitesForOwner(${ownerUsername}): ${matched.length} sitios via cyberpanel DB [${matched.map((m) => m.domain).join(',')}]`,
      );
      return matched;
    } catch (error: any) {
      const stderr =
        (error?.stderr && error.stderr.toString && error.stderr.toString().slice(0, 400)) || '';
      this.logger.warn(
        `listSitesForOwner(${ownerUsername}): query MySQL fallo: ${error?.message || error} stderr=${stderr}`,
      );
      return [];
    }
  }

  async changePackage(username: string, packageName: string) {
    const body: Record<string, any> = {
      websiteOwner: username,
      packageName,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    return this.request(this.changePackagePath, body);
  }

  buildStrongMailboxPassword(length = 14) {
    return this.buildStrongPassword(length);
  }

  /**
   * URL del webmail que abre el cliente con sus credenciales recien creadas.
   * Por defecto apunta al SnappyMail bundleado dentro de CyberPanel.
   */
  getWebmailUrl(_domain?: string) {
    const explicit = process.env.CYBERPANEL_WEBMAIL_URL;
    if (explicit) return explicit;
    const base = this.panelUrl.replace(/\/?$/, '/');
    return `${base}snappymail/`;
  }

  /**
   * Lista los mailboxes (cuentas de correo) que pertenecen a los dominios
   * pasados. Consulta la BD MySQL local de CyberPanel ya que CyberPanel no
   * tiene endpoint API estable para listarlos.
   */
  async listMailboxesForDomains(
    domains: string[],
  ): Promise<Array<{ email: string; domain: string }>> {
    if (!domains.length) return [];
    // Hardening: solo dominios que parezcan validos.
    const safe = domains.filter((d) => /^[a-zA-Z0-9.-]+$/.test(d));
    if (!safe.length) return [];

    const password = this.resolveCyberpanelDbPassword();
    if (!password) {
      this.logger.warn('listMailboxesForDomains: no se pudo obtener password MySQL');
      return [];
    }

    const dbUser = process.env.CYBERPANEL_DB_USER || 'root';
    const dbName = process.env.CYBERPANEL_DB_NAME || 'cyberpanel';

    // CyberPanel ha cambiado de nombres de tabla entre versiones. Intentamos
    // las dos mas comunes en orden.
    const candidates: Array<{ table: string; emailCol: string }> = [
      { table: 'e_users', emailCol: 'email' },
      { table: 'mailServer_eusers', emailCol: 'email' },
      { table: 'mailserver_eusers', emailCol: 'email' },
    ];

    const domainsList = safe.map((d) => `'${d}'`).join(',');
    const emailLikeClauses = safe
      .map((d) => `${candidates[0].emailCol} LIKE '%@${d}'`)
      .join(' OR ');

    for (const cand of candidates) {
      const sql =
        `SELECT ${cand.emailCol} FROM ${cand.table} WHERE ` +
        safe.map((d) => `${cand.emailCol} LIKE '%@${d}'`).join(' OR ');
      try {
        const output = execFileSync(
          'mysql',
          [`-u${dbUser}`, '-N', '-B', dbName, '-e', sql],
          {
            env: { ...process.env, MYSQL_PWD: password },
            timeout: 10000,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
          },
        );
        const rows = output
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((email) => {
            const at = email.lastIndexOf('@');
            return {
              email,
              domain: at > 0 ? email.slice(at + 1) : '',
            };
          })
          .filter((r) => r.email.includes('@'));
        this.logger.log(
          `listMailboxesForDomains via ${cand.table}: ${rows.length} mailboxes`,
        );
        return rows;
      } catch (error: any) {
        const stderr = (error?.stderr?.toString?.() || '').slice(0, 200);
        this.logger.log(
          `listMailboxesForDomains tabla ${cand.table} fallo (probamos siguiente): ${stderr || error?.message}`,
        );
        // probamos con la siguiente
      }
    }

    this.logger.warn(
      'listMailboxesForDomains: ninguna tabla candidata respondio. Verifica el schema de tu CyberPanel.',
    );
    void domainsList;
    void emailLikeClauses;
    return [];
  }

  async createMailbox(params: { domain: string; localPart: string; password: string }) {
    const localPart = (params.localPart || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(localPart)) {
      throw new BadRequestException(
        'El nombre del correo solo puede usar letras minusculas, numeros, puntos, guiones o guion bajo.',
      );
    }
    if (!params.password || params.password.length < 8) {
      throw new BadRequestException(
        'La contrasena debe tener al menos 8 caracteres.',
      );
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(params.domain)) {
      throw new BadRequestException('Dominio invalido.');
    }

    // CyberPanel solo expone gestion de correos via su UI interna
    // (/email/submitEmailCreation) que requiere sesion admin — los /api/*
    // no incluyen este endpoint. Usamos getAuthCookie como en
    // installWordPress.
    const authContext = await this.getAuthCookie();
    if (!authContext) {
      throw new BadRequestException(
        'No se pudo obtener sesion de CyberPanel para crear el correo.',
      );
    }

    // CyberPanel renombra password->passwordByPass en /email/submitEmailCreation
    // (al igual que en installWordpress). Mandamos ambos por compatibilidad.
    const body: Record<string, any> = {
      domain: params.domain,
      username: localPart,
      password: params.password,
      passwordByPass: params.password,
    };

    const path =
      process.env.CYBERPANEL_API_CREATE_EMAIL_PATH || '/email/submitEmailCreation';
    await this.request(path, body, 30000, authContext);
    return { email: `${localPart}@${params.domain}` };
  }

  async createChildDomain(params: {
    masterDomain: string;
    subdomain: string; // ej. "blog"
    websiteOwner: string;
    ownerPassword: string;
  }) {
    const sub = (params.subdomain || '').trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(sub) || sub.length < 1 || sub.length > 30) {
      throw new BadRequestException(
        'El subdominio solo puede tener letras, numeros o guiones (max 30 caracteres).',
      );
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(params.masterDomain)) {
      throw new BadRequestException('Dominio padre invalido.');
    }
    const fullDomain = `${sub}.${params.masterDomain}`;
    const phpSelection = this.normalizePhpSelection(
      process.env.CYBERPANEL_PHP_SELECTION || process.env.CYBERPANEL_PHP,
    );
    const body: Record<string, any> = {
      masterDomain: params.masterDomain,
      domain: fullDomain,
      phpSelection,
      ssl: 1,
      dkimCheck: 0,
      openBasedir: 0,
      websiteOwner: params.websiteOwner,
      ownerPassword: params.ownerPassword,
    };
    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }
    const path =
      process.env.CYBERPANEL_API_CREATE_CHILD_DOMAIN_PATH ||
      '/api/createChildDomain';
    await this.request(path, body, 60000);
    return { domain: fullDomain };
  }

  async deleteChildDomain(domain: string) {
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      throw new BadRequestException('Dominio invalido.');
    }
    const body: Record<string, any> = { domainName: domain };
    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }
    const path =
      process.env.CYBERPANEL_API_DELETE_CHILD_DOMAIN_PATH ||
      '/api/deleteChildDomain';
    try {
      await this.request(path, body, 60000);
      return true;
    } catch (error: any) {
      this.logger.error(`deleteChildDomain(${domain}) fallo: ${error?.message || error}`);
      return false;
    }
  }

  async listChildDomainsForMaster(
    masterDomain: string,
  ): Promise<Array<{ domain: string; state?: string }>> {
    if (!/^[a-zA-Z0-9.-]+$/.test(masterDomain)) return [];

    const password = this.resolveCyberpanelDbPassword();
    if (!password) return [];

    const dbUser = process.env.CYBERPANEL_DB_USER || 'root';
    const dbName = process.env.CYBERPANEL_DB_NAME || 'cyberpanel';
    const sql =
      `SELECT c.domain, c.state FROM websiteFunctions_childdomains c ` +
      `JOIN websiteFunctions_websites w ON c.master_id = w.id ` +
      `WHERE w.domain = '${masterDomain}'`;

    try {
      const output = execFileSync(
        'mysql',
        [`-u${dbUser}`, '-N', '-B', dbName, '-e', sql],
        {
          env: { ...process.env, MYSQL_PWD: password },
          timeout: 10000,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      return output
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const cols = line.split('\t');
          return { domain: cols[0]?.trim() || '', state: cols[1]?.trim() || undefined };
        })
        .filter((r) => r.domain);
    } catch (error: any) {
      this.logger.warn(
        `listChildDomainsForMaster(${masterDomain}) fallo: ${error?.message || error}`,
      );
      return [];
    }
  }

  async issueSSL(domain: string) {
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      throw new BadRequestException('Dominio invalido.');
    }
    const body: Record<string, any> = { domainName: domain };
    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }
    const path = process.env.CYBERPANEL_API_ISSUE_SSL_PATH || '/api/issueSSL';
    await this.request(path, body, 120000);
    return true;
  }

  async deleteMailbox(email: string) {
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(email)) {
      throw new BadRequestException('Email invalido.');
    }
    const authContext = await this.getAuthCookie();
    if (!authContext) {
      this.logger.warn(`deleteMailbox(${email}): sin sesion CyberPanel`);
      return false;
    }
    const body: Record<string, any> = { email };
    const path =
      process.env.CYBERPANEL_API_DELETE_EMAIL_PATH || '/email/submitEmailDeletion';
    try {
      await this.request(path, body, 30000, authContext);
      return true;
    } catch (error: any) {
      this.logger.error(
        `deleteMailbox(${email}) fallo: ${error?.message || error}`,
      );
      return false;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // ALIAS DE DOMINIO (vhAlias) — vincula un dominio externo del cliente
  // al vhost del subdominio plia.pe SIN consumir slot de CyberPanel.
  // Toda la operación atómica vive en el script bash plia-attach-domain.sh
  // que hace backup + cambios + certbot + restart + rollback automático.
  // ──────────────────────────────────────────────────────────────────

  /**
   * Vincula `aliasDomain` (ej. mi-marca.com) como vhAlias del vhost de
   * `subdomain` (ej. cevicheriaperu.plia.pe). El subdominio queda sirviendo
   * los mismos archivos para ambos hosts y se re-emite el cert Let's Encrypt
   * con multi-SAN.
   *
   * Lanza BadRequestException si el script falla (rollback ya aplicado).
   */
  async attachAliasDomain(subdomain: string, aliasDomain: string): Promise<{
    ok: boolean;
    step: string;
    message: string;
  }> {
    this.validateDomain(subdomain, 'subdomain');
    this.validateDomain(aliasDomain, 'aliasDomain');

    const script = this.resolveAttachDomainScript();
    this.logger.log(
      `attachAliasDomain script=${script} subdomain=${subdomain} alias=${aliasDomain}`,
    );

    try {
      const { stdout, stderr } = await execFileAsync(
        '/bin/bash',
        [script, 'attach', subdomain, aliasDomain],
        { timeout: 120_000, maxBuffer: 1024 * 1024 },
      );
      const out = (stdout || '').trim();
      const parsed = this.parseScriptJson(out);
      this.logger.log(
        `attachAliasDomain ok subdomain=${subdomain} alias=${aliasDomain} step=${parsed.step}`,
      );
      if (stderr) {
        this.logger.warn(`attachAliasDomain stderr: ${stderr.slice(0, 500)}`);
      }
      return parsed;
    } catch (error: any) {
      const stderr = (error?.stderr || '').toString().trim();
      const stdout = (error?.stdout || '').toString().trim();
      const parsed = this.parseScriptJson(stderr || stdout, {
        ok: false,
        step: 'script',
        message: error?.message || String(error),
      });
      this.logger.error(
        `attachAliasDomain FAIL subdomain=${subdomain} alias=${aliasDomain} step=${parsed.step} msg=${parsed.message}`,
      );
      throw new BadRequestException(
        `No se pudo vincular el dominio (${parsed.step}): ${parsed.message}`,
      );
    }
  }

  /**
   * Inverso de attachAliasDomain: remueve el alias del vhost y de los
   * mappings del listener, re-emite el cert sin el alias. Idempotente
   * (si no estaba vinculado, no falla).
   */
  async detachAliasDomain(subdomain: string, aliasDomain: string): Promise<{
    ok: boolean;
    step: string;
    message: string;
  }> {
    this.validateDomain(subdomain, 'subdomain');
    this.validateDomain(aliasDomain, 'aliasDomain');

    const script = this.resolveAttachDomainScript();
    try {
      const { stdout } = await execFileAsync(
        '/bin/bash',
        [script, 'detach', subdomain, aliasDomain],
        { timeout: 90_000, maxBuffer: 1024 * 1024 },
      );
      return this.parseScriptJson((stdout || '').trim());
    } catch (error: any) {
      const stderr = (error?.stderr || '').toString().trim();
      const parsed = this.parseScriptJson(stderr, {
        ok: false,
        step: 'script',
        message: error?.message || String(error),
      });
      this.logger.error(
        `detachAliasDomain FAIL subdomain=${subdomain} alias=${aliasDomain} msg=${parsed.message}`,
      );
      throw new BadRequestException(
        `No se pudo desvincular el dominio (${parsed.step}): ${parsed.message}`,
      );
    }
  }

  /** Path al script bash en disco. Se busca primero en PLIA_ATTACH_SCRIPT (env),
   * luego en backend/scripts/, luego en /usr/local/bin/plia-attach-domain.sh. */
  private resolveAttachDomainScript(): string {
    const envPath = process.env.PLIA_ATTACH_DOMAIN_SCRIPT;
    if (envPath && fs.existsSync(envPath)) return envPath;
    const localScript = path.join(
      process.cwd(),
      'scripts',
      'plia-attach-domain.sh',
    );
    if (fs.existsSync(localScript)) return localScript;
    const installed = '/usr/local/bin/plia-attach-domain.sh';
    if (fs.existsSync(installed)) return installed;
    throw new BadRequestException(
      'Script plia-attach-domain.sh no encontrado. Setea PLIA_ATTACH_DOMAIN_SCRIPT o copia el script a /usr/local/bin/.',
    );
  }

  private parseScriptJson(
    raw: string,
    fallback: { ok: boolean; step: string; message: string } = {
      ok: false,
      step: 'unknown',
      message: 'Sin respuesta del script',
    },
  ): { ok: boolean; step: string; message: string } {
    if (!raw) return fallback;
    // Algunas líneas del script pueden ir a stdout antes del JSON final.
    // Buscar la última línea que parece JSON.
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean).reverse();
    for (const line of lines) {
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const obj = JSON.parse(line);
          return {
            ok: !!obj.ok,
            step: String(obj.step || 'unknown'),
            message: String(obj.message || ''),
          };
        } catch {
          continue;
        }
      }
    }
    return fallback;
  }

  /** Valida dominio: sin protocolo, sin path, formato razonable. */
  private validateDomain(domain: string, field: string): void {
    if (!domain || typeof domain !== 'string') {
      throw new BadRequestException(`${field}: dominio vacío`);
    }
    if (!/^[a-z0-9][a-z0-9-]{0,62}(\.[a-z0-9][a-z0-9-]{0,62})+$/.test(domain)) {
      throw new BadRequestException(
        `${field}: formato de dominio inválido (${domain})`,
      );
    }
    // Reglas extras
    if (domain.length > 253) {
      throw new BadRequestException(`${field}: dominio demasiado largo`);
    }
    if (domain.includes('..') || domain.startsWith('-') || domain.endsWith('-')) {
      throw new BadRequestException(`${field}: dominio con caracteres inválidos`);
    }
  }
}
