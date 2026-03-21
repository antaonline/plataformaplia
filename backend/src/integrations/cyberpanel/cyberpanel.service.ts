import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import https from 'https';
import { PrismaService } from '../../prisma/prisma.service';

export type StoredCyberpanelAccount = {
  username: string;
  email: string;
  panelUrl: string;
  ownerType: 'customer';
  createdAt: string;
  sourceProjectId?: number;
};

export type EnsureSiteResult = {
  domain: string | null;
  createdWebsite: boolean;
  accountCreated: boolean;
  account?: StoredCyberpanelAccount;
  plainPassword?: string;
};

@Injectable()
export class CyberpanelService {
  private readonly logger = new Logger(CyberpanelService.name);

  constructor(private prisma: PrismaService) {}

  private get baseUrl() {
    const raw = process.env.CYBERPANEL_API_URL || '';
    const port = process.env.CYBERPANEL_API_PORT;
    if (!raw) return '';
    if (raw.includes(':') && raw.includes('://')) {
      return raw;
    }
    if (port) {
      return `${raw.replace(/\/$/, '')}:${port}`;
    }
    return raw.replace(/\/$/, '');
  }

  private get createPath() {
    return process.env.CYBERPANEL_API_CREATE_PATH || '/api/createWebsite';
  }

  private get createUserPath() {
    return process.env.CYBERPANEL_API_CREATE_USER_PATH || '/api/createUser';
  }

  private get deletePath() {
    return process.env.CYBERPANEL_API_DELETE_PATH || '/api/deleteWebsite';
  }

  private get panelUrl() {
    const raw = process.env.CYBERPANEL_PANEL_URL || this.baseUrl;
    return raw.replace(/\/?$/, '/');
  }

  private get headers() {
    const key = process.env.CYBERPANEL_API_KEY;
    if (!key) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      Authorization: key,
    };
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
      data.fetchStatus,
      data.success,
    ];
    return candidates.some((value) => value === 1 || value === '1' || value === true);
  }

  private extractErrorMessage(data: any) {
    if (!data) return 'Unknown error';
    if (typeof data === 'string') return data;
    return (
      data.error_message ||
      data.errorMessage ||
      data.message ||
      data.error ||
      JSON.stringify(data)
    );
  }

  private isAlreadyExistsMessage(message: string) {
    return /(already exists|exists already|duplicate|taken|is not unique)/i.test(message);
  }

  private async request(path: string, body: Record<string, any>) {
    const url = `${this.baseUrl}${path}`;
    const res = await axios.post(url, body, {
      headers: this.headers,
      httpsAgent: this.httpsAgent,
    });
    if (!this.isSuccessResponse(res.data)) {
      throw new Error(this.extractErrorMessage(res.data));
    }
    return res.data;
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

  private normalizeSubdomain(value: string) {
    const cleaned = value
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

  private buildWebsiteRequest(domain: string, account: StoredCyberpanelAccount) {
    const packageName = process.env.CYBERPANEL_PACKAGE || 'Default';
    const phpSelection = this.normalizePhpSelection(
      process.env.CYBERPANEL_PHP_SELECTION || process.env.CYBERPANEL_PHP,
    );
    const body: Record<string, any> = {
      domainName: domain,
      email: account.email,
      owner: account.username,
      phpSelection,
      packageName,
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

  private async ensureCustomerAccount(project: any): Promise<{
    account: StoredCyberpanelAccount;
    accountCreated: boolean;
    plainPassword?: string;
  }> {
    const existing = await this.findStoredAccount(project.userId);
    if (existing) {
      return {
        account: existing,
        accountCreated: false,
      };
    }

    const user = project.user;
    const username = this.buildCustomerUsername(project.userId, user?.name, user?.email);
    const password = this.buildStrongPassword();
    const email = user?.email || process.env.CYBERPANEL_DEFAULT_EMAIL || 'admin@plia.pe';
    const { firstName, lastName } = this.splitName(user?.name || '');
    const websitesLimit = Number(process.env.CYBERPANEL_USER_WEBSITES_LIMIT || 100);
    const selectedACL = process.env.CYBERPANEL_USER_ACL || 'user';
    const securityLevel = process.env.CYBERPANEL_USER_SECURITY_LEVEL || 'HIGH';
    const packageName = process.env.CYBERPANEL_PACKAGE || 'Default';

    const body: Record<string, any> = {
      firstName,
      lastName,
      email,
      userName: username,
      password,
      packageName,
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
      const responseData = error?.response?.data;
      const message = this.extractErrorMessage(responseData || error?.message || error);
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
        sourceProjectId: project.id,
      },
      accountCreated,
      plainPassword: accountCreated ? password : undefined,
    };
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
    const preferred = this.normalizeSubdomain(data.subdomain || '');
    const sourceName = data.businessName || project.name || `proyecto-${project.id}`;
    const slug = this.slugify(sourceName) || `proyecto-${project.id}`;
    let domain = `${preferred || slug}.${baseDomain}`;
    const existing = await this.prisma.project.findFirst({
      where: { onboardingData: { path: 'publicDomain', equals: domain } as any },
    });
    if (existing) {
      domain = `${slug}-${project.id}.${baseDomain}`;
    }
    const accountProvision = await this.ensureCustomerAccount(project);
    const account = accountProvision.account;
    const siteRequest = this.buildWebsiteRequest(domain, account);

    try {
      this.logger.log(
        `CyberPanel provisioning ${siteRequest.type} for ${domain} via ${siteRequest.path}`,
      );
      const response = await this.request(siteRequest.path, siteRequest.body);
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: { set: {
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
          } },
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
          onboardingData: { set: {
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
          } },
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
    if (!project) return null;
    const data = (project.onboardingData as any) || {};
    const domain = data.publicDomain;
    if (!domain) return null;

    const body = {
      domainName: domain,
    };

    try {
      const url = `${this.baseUrl}${this.deletePath}`;
      await axios.post(url, body, { headers: this.headers, httpsAgent: this.httpsAgent });
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: { set: {
            ...data,
            cyberpanel: {
              ...(data.cyberpanel || {}),
              deletedAt: new Date().toISOString(),
            },
          } },
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error('CyberPanel delete error', error?.message || error);
      return false;
    }
  }
}
