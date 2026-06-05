import { Module } from '@nestjs/common';
import { StudioPlansModule } from '../studio-plans/studio-plans.module';
import { MuapiService } from './muapi.service';
import { MuapiController } from './muapi.controller';

@Module({
  imports: [StudioPlansModule],
  controllers: [MuapiController],
  providers: [MuapiService],
  exports: [MuapiService],
})
export class MuapiModule {}
