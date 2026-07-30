import { Module } from '@nestjs/common';
import { FunnelLeadsService } from './funnel-leads.service';
import { FunnelLeadsController } from './funnel-leads.controller';
import { AdminFunnelLeadsController } from './admin-funnel-leads.controller';

// PrismaModule es @Global, así que PrismaService ya está disponible sin importar.
@Module({
  controllers: [FunnelLeadsController, AdminFunnelLeadsController],
  providers: [FunnelLeadsService],
})
export class FunnelLeadsModule {}
