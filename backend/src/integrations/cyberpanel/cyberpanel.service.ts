import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import https from 'https';
import { PrismaService } from '../../prisma/prisma.service';

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
    const raw = process.env.CYBERPANEL_PANEL_URL || this.baseUrl;
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
    if (!data || typeof data !== 'object') return true;
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
      const account = (project.onboardingData as any)?.cyberpanel?.account;
      if (account?.username && account?.panelUrl) {
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
    const data = (project.onboardingData as any) || {};
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
      where: { onboardingData: { path: 'publicDomain', equals: domain } as any },
    });
    if (existing) {
      throw new BadRequestException('El subdominio elegido ya esta en uso. Elige otro.');
    }
    const accountProvision = await this.ensureCustomerAccount(project);
    const account = accountProvision.account;
    const ownerPassword =
      accountProvision.plainPassword ||
      process.env.CYBERPANEL_EXISTING_USER_PASSWORD ||
      '';
    const siteRequest = this.buildWebsiteRequest(domain, account, ownerPassword);
    try {
      const response = await this.createSiteForAccount(domain, account, ownerPassword);
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: {
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
          },
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
          onboardingData: {
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
          },
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
    const data = (project.onboardingData as any) || {};
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
          onboardingData: {
            ...data,
            cyberpanel: {
              ...(data.cyberpanel || {}),
              deletedAt: new Date().toISOString(),
            },
          },
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
}
