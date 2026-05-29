import { Module } from '@nestjs/common';
import { AiChatController } from './iachat.controller';
import { AiChatService } from './iachat.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiModule } from '../../ai/ai.module';
import { CodegenService } from './generation/codegen.service';
import { CreditService } from './generation/credit.service';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AiChatController],
  providers: [AiChatService, CodegenService, CreditService, WorkspaceService],
  exports: [AiChatService, CreditService, WorkspaceService],
})
export class AiChatModule {}
