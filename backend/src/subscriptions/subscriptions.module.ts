
import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsController } from './subscriptions.controller';
import { IzipayService } from '../payments/izipay.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PrismaService, IzipayService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
