import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { StudioPlansController } from './studio-plans.controller';
import { StudioPlansService } from './studio-plans.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudioPlansController],
  providers: [StudioPlansService],
  exports: [StudioPlansService],
})
export class StudioPlansModule {}
