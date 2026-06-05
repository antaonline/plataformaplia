import { Module } from '@nestjs/common';
import { AiChatController } from './iachat.controller';
import { AiChatService } from './iachat.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiModule } from '../../ai/ai.module';
import { CodegenService } from './generation/codegen.service';
import { CreditService } from './generation/credit.service';
import { WorkspaceService } from './workspace.service';
import { StudioPlansModule } from './studio-plans/studio-plans.module';
import { Templates3DModule } from './templates-3d/templates-3d.module';

@Module({
  imports: [PrismaModule, AiModule, StudioPlansModule, Templates3DModule],
  controllers: [AiChatController],
  providers: [AiChatService, CodegenService, CreditService, WorkspaceService],
  exports: [
    AiChatService,
    CreditService,
    WorkspaceService,
    StudioPlansModule,
    Templates3DModule,
  ],
})
export class AiChatModule {}
