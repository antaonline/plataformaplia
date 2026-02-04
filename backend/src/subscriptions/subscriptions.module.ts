
import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SubscriptionsService, PrismaService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
