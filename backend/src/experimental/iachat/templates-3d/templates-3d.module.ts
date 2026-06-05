import { Module } from '@nestjs/common';
import { StudioPlansModule } from '../studio-plans/studio-plans.module';
import { Templates3DController } from './templates-3d.controller';
import { Templates3DService } from './templates-3d.service';

@Module({
  imports: [StudioPlansModule],
  controllers: [Templates3DController],
  providers: [Templates3DService],
  exports: [Templates3DService],
})
export class Templates3DModule {}
