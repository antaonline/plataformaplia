import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly transporter

  constructor() {
    const host = process.env.MAIL_HOST || 'plia.pe'
    const port = Number(process.env.MAIL_PORT || 587)
    const user = process.env.MAIL_USER
    const pass = process.env.MAIL_PASS

    this.logger.log(
      `SMTP config host=${host} port=${port} user=${user || 'missing'}`,
    )

    // MAIL_TLS_INSECURE=true permite servidores SMTP con certificado
     // self-signed (p.ej. el servidor de correo del propio CyberPanel).
    const tlsInsecure = process.env.MAIL_TLS_INSECURE === 'true'

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      ...(tlsInsecure ? { tls: { rejectUnauthorized: false } } : {}),
    })

    this.transporter
      .verify()
      .then(() => this.logger.log('SMTP listo'))
      .catch((error) => this.logger.error('SMTP verify fallo', error?.stack || String(error)))
  }

  private async sendMail(
    options: nodemailer.SendMailOptions,
    context: string,
  ) {
    try {
      const info = await this.transporter.sendMail(options)
      this.logger.log(
        `SMTP ${context} accepted=${JSON.stringify(info.accepted || [])} rejected=${JSON.stringify(
          info.rejected || [],
        )} response=${info.response || 'n/a'} messageId=${info.messageId || 'n/a'}`,
      )
      return info
    } catch (error: any) {
      this.logger.error(
        `SMTP ${context} fallo`,
        error?.stack || JSON.stringify(error, null, 2),
      )
      throw error
    }
  }

  async send2FACode(email: string, code: string) {
    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Codigo de verificacion',
        text: `Tu codigo 2FA es: ${code}`,
      },
      '2FA',
    )

    this.logger.log(`Mail 2FA enviado a ${email}`)
  }

  async sendTestMail(email: string) {
    await this.sendMail(
      {
        from: `"Plia Security" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Prueba SMTP',
        text: 'SMTP funcionando correctamente',
      },
      'test',
    )
  }

  async sendAccountSetup(email: string, token: string) {
    const baseUrl = process.env.APP_URL ?? 'http://localhost:3001'
    const link = `${baseUrl}/set-password?token=${token}`

    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Configura tu contrasena',
        text: `Bienvenido. Configura tu contrasena aqui: ${link}`,
      },
      'account setup',
    )
  }

  async sendRenewalNotice(email: string, daysLeft: number) {
    const subject =
      daysLeft === 14
        ? 'Renovacion de hosting pendiente'
        : daysLeft === 7
          ? 'Tu hosting vence en 7 dias'
          : 'Tu hosting vence en 1 dia'

    const text =
      daysLeft === 14
        ? 'Tu hosting anual vencio. Tienes 14 dias para renovar y evitar la eliminacion de tu sitio.'
        : daysLeft === 7
          ? 'Tu hosting vence en 7 dias. Renueva para evitar la eliminacion de tu sitio.'
          : 'Tu hosting vence manana. Renueva hoy para evitar la eliminacion de tu sitio.'

    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        text,
      },
      'renewal',
    )
  }

  private getAppUrl() {
    return (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '')
  }

  private escapeHtml(value?: string) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  async sendProjectReady(
    email: string,
    payload: {
      projectName?: string
      loginUrl: string
      hostingAccess?: {
        panelUrl: string
        username: string
        password: string
      }
    },
  ) {
    const projectName = payload.projectName || 'tu proyecto'
    const loginUrl = payload.loginUrl
    const hasHostingAccess = Boolean(payload.hostingAccess)
    const subject = hasHostingAccess
      ? 'Tu acceso de hosting PLIA ya esta listo'
      : 'Tu web ya esta lista para revisar'
    const appUrl = this.getAppUrl()
    const logoUrl = `${appUrl}/plia-logo-black.svg`
    const heading = hasHostingAccess
      ? 'Tu acceso de hosting esta listo'
      : 'Tu web esta lista'
    const intro = hasHostingAccess
      ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#111827;">
          <strong>${this.escapeHtml(projectName)}</strong> ya tiene su acceso inicial de hosting en CyberPanel.
          Usa estas credenciales para entrar a tu panel tecnico cuando necesites gestionar archivos, bases de datos o dominios.
        </p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#6b7280;">
          Por seguridad, la contrasena completa solo se muestra en este correo. Guardala en un gestor seguro.
        </p>`
      : `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#111827;">
          <strong>${this.escapeHtml(projectName)}</strong> ya completo su ciclo de desarrollo.
          Ahora puedes ingresar a tu panel para revisar el resultado final y solicitar cambios si lo deseas.
        </p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#6b7280;">
          Te recomendamos ingresar hoy mismo para validar el contenido, colores y secciones.
        </p>`
    const hostingBlock = payload.hostingAccess
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border:1px solid #d9f99d;border-radius:18px;background:#f7fee7;">
          <tr>
            <td style="padding:20px 22px;">
              <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#3f6212;">Acceso CyberPanel</div>
              <div style="margin-top:14px;font-size:14px;line-height:1.7;color:#111827;">
                <div><strong>Panel:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.panelUrl)}</span></div>
                <div><strong>Usuario:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.username)}</span></div>
                <div><strong>Contrasena:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.password)}</span></div>
              </div>
              <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#4d7c0f;">
                Si compras mas sitios en PLIA, se asociaran a este mismo usuario de hosting para mantener una sola cuenta tecnica por cliente.
              </p>
            </td>
          </tr>
        </table>
      `
      : ''
    const html = `
      <div style="background:#f6f7fb;padding:24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,hsl(75 100% 50%) 0%,hsl(80 100% 45%) 100%);color:#1a1a0a;">
              <img src="${logoUrl}" alt="PLIA" width="104" height="30" style="display:block;width:104px;height:auto;" />
              <h1 style="margin:18px 0 6px;font-size:24px;line-height:1.3;color:#1a1a0a;">${heading}</h1>
              <p style="margin:0;font-size:14px;color:#2f3b0b;">
                ${hasHostingAccess ? 'Tu cuenta tecnica ya fue creada en PLIA Hosting.' : 'Revisa tu resultado y pidemos ajustes si lo necesitas.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              ${intro}
              ${hostingBlock}
              <a href="${loginUrl}" style="display:inline-block;background:hsl(75 100% 45%);color:#111827;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;font-size:14px;">
                Ingresar a mi cuenta
              </a>
              <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
                Si el boton no funciona, copia y pega este enlace en tu navegador:<br />
                <span style="color:#6b7280;">${this.escapeHtml(loginUrl)}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                PLIA - Soporte: soporte@plia.pe
              </p>
            </td>
          </tr>
        </table>
      </div>
    `

    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html,
      },
      'project ready',
    )
  }

  async sendHostingPanelReady(
    email: string,
    payload: {
      planName?: string
      loginUrl: string
      hostingAccess: {
        panelUrl: string
        username: string
        password: string
      }
    },
  ) {
    const subject = 'Tu cuenta de hosting PLIA ya esta activa'
    const appUrl = this.getAppUrl()
    const logoUrl = `${appUrl}/plia-logo-black.svg`
    const html = `
      <div style="background:#f6f7fb;padding:24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#d9f99d 0%,#bef264 100%);color:#1a1a0a;">
              <img src="${logoUrl}" alt="PLIA" width="104" height="30" style="display:block;width:104px;height:auto;" />
              <h1 style="margin:18px 0 6px;font-size:24px;line-height:1.3;color:#1a1a0a;">Tu hosting ya esta activo</h1>
              <p style="margin:0;font-size:14px;color:#3f6212;">
                ${this.escapeHtml(payload.planName || 'Tu plan PLIA')} ya quedo habilitado y listo para crear sitios.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#111827;">
                Ya puedes entrar a tu dashboard PLIA para crear sitios, subir tu web y administrar tu capacidad.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border:1px solid #d9f99d;border-radius:18px;background:#f7fee7;">
                <tr>
                  <td style="padding:20px 22px;">
                    <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#3f6212;">Acceso tecnico</div>
                    <div style="margin-top:14px;font-size:14px;line-height:1.7;color:#111827;">
                      <div><strong>Panel:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.panelUrl)}</span></div>
                      <div><strong>Usuario:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.username)}</span></div>
                      <div><strong>Contrasena:</strong> <span style="color:#365314;">${this.escapeHtml(payload.hostingAccess.password)}</span></div>
                    </div>
                  </td>
                </tr>
              </table>
              <a href="${payload.loginUrl}" style="display:inline-block;background:hsl(75 100% 45%);color:#111827;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;font-size:14px;">
                Ir a mi dashboard de hosting
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                PLIA - Soporte: soporte@plia.pe
              </p>
            </td>
          </tr>
        </table>
      </div>
    `

    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html,
      },
      'hosting panel ready',
    )
  }

  async sendContactMessage(payload: {
    name: string
    email: string
    phone: string
    business?: string
    message: string
  }) {
    const subject = `Nuevo contacto: ${payload.name}`
    const html = `
      <div style="background:#f6f7fb;padding:24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:26px 32px;background:linear-gradient(135deg,#16a34a 0%,#22c55e 45%,#86efac 100%);color:#052e16;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#052e16;">PLIA</div>
              <h1 style="margin:10px 0 4px;font-size:22px;line-height:1.3;color:#052e16;">Nuevo mensaje de contacto</h1>
              <p style="margin:0;font-size:13px;color:#052e16;">Recibiste una nueva solicitud desde plia.pe/contacto</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
                    <strong style="display:block;font-size:12px;color:#94a3b8;">Nombre</strong>
                    <span style="font-size:15px;color:#0f172a;">${payload.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
                    <strong style="display:block;font-size:12px;color:#94a3b8;">Correo</strong>
                    <span style="font-size:15px;color:#0f172a;">${payload.email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
                    <strong style="display:block;font-size:12px;color:#94a3b8;">Telefono</strong>
                    <span style="font-size:15px;color:#0f172a;">${payload.phone}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
                    <strong style="display:block;font-size:12px;color:#94a3b8;">Negocio</strong>
                    <span style="font-size:15px;color:#0f172a;">${payload.business || '-'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <strong style="display:block;font-size:12px;color:#94a3b8;">Mensaje</strong>
                    <p style="margin:6px 0 0;font-size:14px;color:#0f172a;line-height:1.6;">${payload.message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">PLIA - Contacto entrante</p>
            </td>
          </tr>
        </table>
      </div>
    `

    await this.sendMail(
      {
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: 'hola@plia.pe',
        replyTo: payload.email,
        subject,
        html,
      },
      'contact',
    )
  }
}
