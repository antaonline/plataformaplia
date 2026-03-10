import { Body, Controller, Post } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { MailService } from '../mail/mail.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async submit(@Body() dto: ContactDto) {
    await this.mailService.sendContactMessage(dto);
    return { ok: true };
  }
}
