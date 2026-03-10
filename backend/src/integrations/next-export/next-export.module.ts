import { Module } from '@nestjs/common';
import { NextExportService } from './next-export.service';

@Module({
  providers: [NextExportService],
  exports: [NextExportService],
})
export class NextExportModule {}
