import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

/**
 * Servicio que recibe las submissions del formulario de contacto que la
 * IA pone en los sitios generados. Reemplaza la dependencia de
 * formsubmit.co y otros servicios externos: PLIA hostea el endpoint y
 * reenvia los mensajes al email del dueno del proyecto.
 */
@Injectable()
export class SiteContactService {
  private readonly logger = new Logger(SiteContactService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async submit(
    projectId: number,
    body: Record<string, any>,
    ipAddress?: string,
  ): Promise<{ ok: true; message: string; publicUrl?: string }> {
    // 1) Honeypot — si el campo invisible viene con valor, es un bot.
    // Devolvemos ok=true en silencio para no darle pistas.
    if (
      body &&
      typeof body._honeypot === 'string' &&
      body._honeypot.trim().length > 0
    ) {
      this.logger.warn(
        `site-contact honeypot project=${projectId} ip=${ipAddress || 'n/a'}`,
      );
      return { ok: true, message: 'Recibido' };
    }

    // 2) Validacion de los 3 campos minimos.
    const name = String(body?.name || '').trim().slice(0, 200);
    const email = String(body?.email || '').trim().slice(0, 320);
    const message = String(body?.message || '').trim().slice(0, 5000);

    if (!name) {
      throw new BadRequestException('El nombre es requerido.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Correo electrónico no válido.');
    }
    if (!message) {
      throw new BadRequestException('El mensaje no puede estar vacío.');
    }

    // 3) Buscar proyecto + datos del dueno.
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    const onboarding = JSON.parse((project.onboardingData as string) || '{}');
    const businessName = onboarding.businessName || project.name;
    // Prioridad: contactEmail del onboarding > email del usuario PLIA.
    const recipientEmail = onboarding.contactEmail || project.user?.email;
    if (!recipientEmail) {
      throw new BadRequestException(
        'Este sitio aún no tiene un correo de contacto configurado.',
      );
    }

    // 4) Recolectar TODOS los campos extra (el formulario puede tener
    //    telefono, fecha, asunto, etc. segun el rubro del cliente).
    const reserved = new Set(['_honeypot', '_next', 'name', 'email', 'message']);
    const customFields: Record<string, string> = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (reserved.has(k)) continue;
      if (typeof v === 'string' && v.trim().length > 0) {
        customFields[k] = v.trim().slice(0, 2000);
      }
    }

    // 5) Enviar correo al dueno del negocio (con replyTo al visitante).
    await this.mailService.sendSiteContactSubmission({
      recipientEmail,
      businessName,
      submitterName: name,
      submitterEmail: email,
      message,
      customFields,
      sourceUrl:
        onboarding.publicUrl ||
        (onboarding.publicDomain ? `https://${onboarding.publicDomain}` : undefined),
    });

    const publicUrl =
      onboarding.publicUrl ||
      (onboarding.publicDomain ? `https://${onboarding.publicDomain}` : undefined);

    this.logger.log(
      `site-contact OK project=${projectId} from=${email} to=${recipientEmail}`,
    );

    return {
      ok: true,
      message: '¡Recibido! Te contactaremos pronto.',
      publicUrl,
    };
  }
}
