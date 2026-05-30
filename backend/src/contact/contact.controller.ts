import { Body, Controller, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactDto } from './dto/contact.dto';
import { MailService } from '../mail/mail.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly mailService: MailService) {}

  // Anti-spam: 5 envíos por minuto por IP. Suficiente para uso humano
  // legítimo (alguien que se equivoca y reintenta), bloquea bots.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  async submit(@Body() dto: ContactDto) {
    // Doble defensa por honeypot — el DTO ya valida con MaxLength(0), pero
    // si por alguna razón llegó algo en `website`, rechazamos en silencio
    // devolviendo 200 (los bots no aprenden si vuelven a intentar).
    if (dto.website && dto.website.length > 0) {
      this.logger.warn(
        `[contact] honeypot triggered: name=${dto.name} email=${dto.email}`,
      );
      return { ok: true }; // mentira amable al bot
    }
    try {
      await this.mailService.sendContactMessage(dto);
      return { ok: true };
    } catch (err: any) {
      this.logger.error(`[contact] sendContactMessage fallo: ${err?.message || err}`);
      throw new HttpException(
        'No se pudo enviar el mensaje. Intenta nuevamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
