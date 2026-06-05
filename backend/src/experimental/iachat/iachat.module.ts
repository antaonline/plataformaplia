import { Module } from '@nestjs/common';
import { AiChatController } from './iachat.controller';
import { AiChatService } from './iachat.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiModule } from '../../ai/ai.module';
import { CodegenService } from './generation/codegen.service';
import { CreditService } from './generation/credit.service';
import { WorkspaceService } from './workspace.service';
import { StudioPlansModule } from './studio-plans/studio-plans.module';

@Module({
  imports: [PrismaModule, AiModule, StudioPlansModule],
  controllers: [AiChatController],
  providers: [AiChatService, CodegenService, CreditService, WorkspaceService],
  exports: [AiChatService, CreditService, WorkspaceService, StudioPlansModule],
})
export class AiChatModule {}
