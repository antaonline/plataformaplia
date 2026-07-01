import { Module } from '@nestjs/common'
import { AffiliatesService } from './affiliates.service'
import { AffiliatesController } from './affiliates.controller'
import { AdminAffiliatesController } from './admin-affiliates.controller'

// PrismaModule es @Global, así que PrismaService ya está disponible sin importar.
@Module({
  controllers: [AffiliatesController, AdminAffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
