import { Module } from '@nestjs/common';
import { CyberpanelService } from './cyberpanel.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CyberpanelService],
  exports: [CyberpanelService],
})
export class CyberpanelModule {}
