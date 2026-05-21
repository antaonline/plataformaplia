import { Module } from '@nestjs/common';
import { AiChatController } from './iachat.controller';
import { AiChatService } from './iachat.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiModule } from '../../ai/ai.module';
import { CodegenService } from './generation/codegen.service';
import { CreditService } from './generation/credit.service';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AiChatController],
  providers: [AiChatService, CodegenService, CreditService],
  exports: [AiChatService, CreditService],
})
export class AiChatModule {}
