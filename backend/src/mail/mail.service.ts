import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  RenderedEmail,
  twoFactorTemplate,
  accountSetupTemplate,
  welcomeTemplate,
  paymentReceiptTemplate,
  projectReadyTemplate,
  projectPublishedTemplate,
  projectFailedTemplate,
  hostingPanelReadyTemplate,
  revisionAcknowledgedTemplate,
  revisionDeployedTemplate,
  renewalNoticeTemplate,
  contactMessageTemplate,
  siteContactSubmissionTemplate,
  customDomainAttachedTemplate,
  TwoFactorPayload,
  AccountSetupPayload,
  WelcomePayload,
  PaymentReceiptPayload,
  ProjectReadyPayload,
  ProjectPublishedPayload,
  ProjectFailedPayload,
  HostingPanelReadyPayload,
  RevisionAcknowledgedPayload,
  RevisionDeployedPayload,
  RenewalNoticePayload,
  ContactMessagePayload,
  SiteContactSubmissionPayload,
  CustomDomainAttachedPayload,
} from './templates';

/**
 * MailService: pipe delgado de envío de correos.
 *
 * Responsabilidades:
 *   1. Inicializar el transporter SMTP (nodemailer).
 *   2. Loggear éxito / fallos para auditoría.
 *   3. Recibir un template renderizado + destinatario y enviar.
 *
 * NO contiene HTML inline. Toda la presentación vive en src/mail/templates.
 * Para agregar un nuevo tipo de correo:
 *   1. Crear el archivo template.ts en src/mail/templates.
 *   2. Exportarlo en src/mail/templates/index.ts.
 *   3. Agregar un metodo publico aqui que lo invoque.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly defaultFromName = 'PLIA';
  private readonly adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'hola@plia.pe';

  constructor() {
    const host = process.env.MAIL_HOST || 'plia.pe';
    const port = Number(process.env.MAIL_PORT || 587);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    this.logger.log(
      `SMTP config host=${host} port=${port} user=${user || 'missing'}`,
    );

    // MAIL_TLS_INSECURE=true permite servidores SMTP con certificado
    // self-signed (p.ej. el servidor de correo del propio CyberPanel).
    const tlsInsecure = process.env.MAIL_TLS_INSECURE === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      ...(tlsInsecure ? { tls: { rejectUnauthorized: false } } : {}),
    });

    this.transporter
      .verify()
      .then(() => this.logger.log('SMTP listo'))
      .catch((error) =>
        this.logger.error('SMTP verify fallo', error?.stack || String(error)),
      );
  }

  /**
   * Envía un correo renderizado por un template. Único punto de salida.
   */
  private async send(args: {
    to: string;
    rendered: RenderedEmail;
    context: string;
    replyTo?: string;
    cc?: string;
  }) {
    const fromUser = process.env.MAIL_USER;
    if (!fromUser) {
      this.logger.error(`SMTP ${args.context}: MAIL_USER no configurado, abortando envio`);
      return;
    }
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.defaultFromName}" <${fromUser}>`,
        to: args.to,
        subject: args.rendered.subject,
        html: args.rendered.html,
        text: args.rendered.text,
        replyTo: args.replyTo,
        cc: args.cc,
      });
      this.logger.log(
        `SMTP ${args.context} ok to=${args.to} accepted=${JSON.stringify(info.accepted || [])} rejected=${JSON.stringify(info.rejected || [])} messageId=${info.messageId || 'n/a'}`,
      );
      // Si SMTP acepto la conexion pero declaro rejected, alertamos para
      // que el admin lo vea aunque la promesa "haya tenido exito".
      if (Array.isArray(info.rejected) && info.rejected.length > 0) {
        this.logger.warn(
          `SMTP ${args.context}: destinatarios RECHAZADOS por el servidor: ${JSON.stringify(info.rejected)}`,
        );
      }
      return info;
    } catch (error: any) {
      this.logger.error(
        `SMTP ${args.context} fallo to=${args.to}`,
        error?.stack || JSON.stringify(error, null, 2),
      );
      // No relanzamos para que un fallo de SMTP no rompa el flujo
      // principal (login, pago, etc.). El admin lo ve en logs.
      return;
    }
  }

  // ============================================================
  // API publica: una funcion por tipo de correo.
  // Llama al template correspondiente y delega en send().
  // ============================================================

  /** Correo genérico (avisos de trial, etc.) con CTA. Branding simple Plia. */
  async sendGenericNotice(
    email: string,
    p: { subject: string; heading: string; body: string; ctaLabel?: string; ctaUrl?: string },
  ) {
    const cta = p.ctaUrl && p.ctaLabel
      ? `<tr><td style="padding:8px 0 24px"><a href="${p.ctaUrl}" style="display:inline-block;background:#D9FF00;color:#0f172a;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px">${p.ctaLabel}</a></td></tr>`
      : '';
    const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;padding:36px;text-align:left">
<tr><td style="font-size:20px;font-weight:800;color:#0f172a;padding-bottom:8px">PLIA</td></tr>
<tr><td style="font-size:24px;font-weight:800;color:#0f172a;padding:8px 0">${p.heading}</td></tr>
<tr><td style="font-size:15px;line-height:1.7;color:#475569;padding:8px 0 24px">${p.body}</td></tr>
${cta}
<tr><td style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px">PLIA · plia.pe — Tu web profesional</td></tr>
</table></td></tr></table></body></html>`;
    const text = `${p.heading}\n\n${p.body}\n\n${p.ctaLabel ? `${p.ctaLabel}: ${p.ctaUrl}` : ''}`;
    return this.send({ to: email, context: 'generic-notice', rendered: { subject: p.subject, html, text } });
  }

  async send2FACode(email: string, code: string) {
    return this.send({
      to: email,
      context: '2FA',
      rendered: twoFactorTemplate({ code, email } as TwoFactorPayload),
    });
  }

  async sendAccountSetup(email: string, token: string) {
    const baseUrl = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    return this.send({
      to: email,
      context: 'account setup',
      rendered: accountSetupTemplate({
        email,
        setupUrl: `${baseUrl}/set-password?token=${token}`,
      } as AccountSetupPayload),
    });
  }

  async sendWelcome(payload: WelcomePayload) {
    return this.send({
      to: payload.email,
      context: 'welcome',
      rendered: welcomeTemplate(payload),
    });
  }

  async sendPaymentReceipt(payload: PaymentReceiptPayload) {
    return this.send({
      to: payload.customerEmail,
      cc: this.adminEmail,
      context: 'payment receipt',
      rendered: paymentReceiptTemplate(payload),
    });
  }

  async sendProjectReady(email: string, payload: ProjectReadyPayload) {
    return this.send({
      to: email,
      context: 'project ready',
      rendered: projectReadyTemplate(payload),
    });
  }

  async sendProjectPublished(email: string, payload: ProjectPublishedPayload) {
    return this.send({
      to: email,
      context: 'project published',
      rendered: projectPublishedTemplate(payload),
    });
  }

  async sendProjectFailed(payload: ProjectFailedPayload) {
    // Alerta interna al admin (no al cliente).
    return this.send({
      to: this.adminEmail,
      context: 'project failed',
      rendered: projectFailedTemplate(payload),
    });
  }

  async sendHostingPanelReady(email: string, payload: HostingPanelReadyPayload) {
    return this.send({
      to: email,
      context: 'hosting panel ready',
      rendered: hostingPanelReadyTemplate(payload),
    });
  }

  async sendRevisionAcknowledged(
    email: string,
    payload: RevisionAcknowledgedPayload,
  ) {
    return this.send({
      to: email,
      context: 'revision acknowledged',
      rendered: revisionAcknowledgedTemplate(payload),
    });
  }

  async sendRevisionDeployed(
    email: string,
    payload: RevisionDeployedPayload,
  ) {
    return this.send({
      to: email,
      context: 'revision deployed',
      rendered: revisionDeployedTemplate(payload),
    });
  }

  async sendRenewalNotice(email: string, daysLeft: 14 | 7 | 1, amount?: number) {
    const baseUrl = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    return this.send({
      to: email,
      context: `renewal ${daysLeft}d`,
      rendered: renewalNoticeTemplate({
        daysLeft,
        amount,
        renewUrl: `${baseUrl}/dashboard?tab=billing`,
      } as RenewalNoticePayload),
    });
  }

  async sendContactMessage(payload: ContactMessagePayload) {
    return this.send({
      to: this.adminEmail,
      replyTo: payload.email,
      context: 'contact',
      rendered: contactMessageTemplate(payload),
    });
  }

  /** Notifica al cliente que su dominio propio quedó vinculado al sitio. */
  async sendCustomDomainAttached(
    payload: { to: string } & CustomDomainAttachedPayload,
  ) {
    const { to, ...data } = payload;
    return this.send({
      to,
      context: `custom domain ${data.customDomain}`,
      rendered: customDomainAttachedTemplate(data),
    });
  }

  async sendSiteContactSubmission(payload: SiteContactSubmissionPayload) {
    return this.send({
      to: payload.recipientEmail,
      replyTo: payload.submitterEmail,
      context: 'site contact',
      rendered: siteContactSubmissionTemplate(payload),
    });
  }

  /** Util manual para probar SMTP. */
  async sendTestMail(email: string) {
    const baseUrl = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    return this.send({
      to: email,
      context: 'test',
      rendered: welcomeTemplate({
        email,
        customerName: 'Tester',
        planName: 'Plan de prueba',
        dashboardUrl: `${baseUrl}/dashboard`,
      }),
    });
  }
}
