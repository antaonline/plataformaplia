import { Body, Controller, Post, UseGuards, Req, HttpCode, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('renewals')
  async getUserRenewals(@Req() req: any) {
    return this.subscriptionsService.getUserRenewals(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('renew/session')
  async createRenewalSession(@Req() req: any, @Body() body: any) {
    const subscriptionId = Number(body?.subscriptionId);
    return this.subscriptionsService.createRenewalSession(req.user.id, subscriptionId);
  }

  @Post('renew/confirm')
  @HttpCode(200)
  async confirmRenewal(@Body() body: any) {
    return this.subscriptionsService.confirmRenewal(body);
  }
}
