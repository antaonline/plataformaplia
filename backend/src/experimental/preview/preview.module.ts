import { Module } from '@nestjs/common';
import { PreviewController, PreviewProxyController } from './preview.controller';
import { PreviewService } from './preview.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PreviewController, PreviewProxyController],
  providers: [PreviewService],
  exports: [PreviewService],
})
export class PreviewModule {}
