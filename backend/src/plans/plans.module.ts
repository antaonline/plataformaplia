import { Module } from '@nestjs/common'
import { PlansController } from './plans.controller'
import { PlansPublicController } from './plans.public.controller'
import { PlansService } from './plans.service'

@Module({
  controllers: [PlansController, PlansPublicController],
  providers: [PlansService],
})
export class PlansModule {}
