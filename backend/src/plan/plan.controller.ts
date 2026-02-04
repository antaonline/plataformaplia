import { Controller, Get } from '@nestjs/common'
import { PlanService } from './plan.service'

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('seed')
  seedPlans() {
    return this.planService.createDefaultPlans()
  }

  @Get()
  getPlans() {
    return this.planService.getPlans()
  }
}
