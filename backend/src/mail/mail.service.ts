import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    this.transporter.verify()
      .then(() => console.log('✅ SMTP listo (Gmail)'))
      .catch(err => console.error('❌ SMTP NO listo:', err.message))
  }


  async send2FACode(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: '"PLIA" <${process.env.MAIL_USER}>',
        to: email,
        subject: 'Código de verificación',
        text: `Tu código 2FA es: ${code}`,
      })

      console.log('📨 Mail 2FA enviado')
    } catch (error) {
      console.error('❌ SMTP FALLÓ (IGNORADO EN LOCAL):', error.message)

      // 🔥 CLAVE: JAMÁS relanzar el error
      return
    }
  }


  async sendTestMail(email: string) {
    await this.transporter.sendMail({
      from: `"Plia Security" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Prueba SMTP',
      text: 'SMTP funcionando correctamente',
    })
  }

  async sendAccountSetup(email: string, token: string) {
    const baseUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const link = `${baseUrl}/set-password?token=${token}`

    try {
      await this.transporter.sendMail({
        from: `"PLIA" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Configura tu contraseña',
        text: `Bienvenido. Configura tu contraseña aquí: ${link}`,
      })
    } catch (error) {
      console.error('❌ SMTP FALLÓ (IGNORADO EN LOCAL):', error.message)
      return
    }
  }

}
