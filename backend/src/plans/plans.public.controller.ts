import { Controller, Get } from '@nestjs/common'
import { PlansService } from './plans.service'

@Controller('public/plans')
export class PlansPublicController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll(1, 50)
  }
}
