import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MetaAdsService } from './meta-ads.service'
import { MetaAdsController } from './meta-ads.controller'
import { MetaAdsCron } from './meta-ads.cron'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [MetaAdsController],
  providers: [MetaAdsService, MetaAdsCron],
  exports: [MetaAdsService],
})
export class MetaAdsModule {}
