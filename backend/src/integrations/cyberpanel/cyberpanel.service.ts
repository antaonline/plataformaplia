import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import https from 'https';
import { PrismaService } from '../../prisma/prisma.service';

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

  private get deletePath() {
    return process.env.CYBERPANEL_API_DELETE_PATH || '/api/deleteWebsite';
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

  async ensureSite(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return null;
    const data = (project.onboardingData as any) || {};
    if (data.publicDomain) {
      return data.publicDomain;
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
    const email = process.env.CYBERPANEL_DEFAULT_EMAIL || 'admin@plia.pe';
    const owner = process.env.CYBERPANEL_OWNER || 'admin';
    const packageName = process.env.CYBERPANEL_PACKAGE || 'default';

    const body: Record<string, any> = {
      domainName: domain,
      email,
      owner,
      packageName,
      ssl: 1,
      dkIMCheck: 0,
      openBasedir: 1,
    };

    if (process.env.CYBERPANEL_ADMIN_USER && process.env.CYBERPANEL_ADMIN_PASS) {
      body.adminUser = process.env.CYBERPANEL_ADMIN_USER;
      body.adminPass = process.env.CYBERPANEL_ADMIN_PASS;
    }

    try {
      const url = `${this.baseUrl}${this.createPath}`;
      const res = await axios.post(url, body, { headers: this.headers, httpsAgent: this.httpsAgent });
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: {
            ...data,
            publicDomain: domain,
            publicUrl: `https://${domain}`,
            cyberpanel: {
              status: 'CREATED',
              response: res.data,
              createdAt: new Date().toISOString(),
            },
          },
        },
      });
      return domain;
    } catch (error: any) {
      this.logger.error('CyberPanel error', error?.message || error);
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          onboardingData: {
            ...data,
            publicDomain: domain,
            publicUrl: `https://${domain}`,
            cyberpanel: {
              status: 'FAILED',
              error: error?.response?.data || error?.message || 'Unknown error',
              createdAt: new Date().toISOString(),
            },
          },
        },
      });
      return domain;
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
}
