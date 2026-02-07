import { Controller, Get, Query } from '@nestjs/common'
import { DomainsService } from './domains.service'

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get('check')
  async check(@Query('query') query: string) {
    return this.domainsService.checkDomains(query)
  }
}
