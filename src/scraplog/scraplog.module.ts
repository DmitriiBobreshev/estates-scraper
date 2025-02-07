import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScrapStatusService } from './scraplog.service';
import {
  ScrapStatusLog,
  ScraperLogSchema,
} from './schemas/scrap-status.schema';
import {
  ScrapLogRecords,
  ScrapLogRecordsSchema,
} from './schemas/scrap-log-records.schema';
import { ScraplogController } from './scraplog.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScrapStatusLog.name, schema: ScraperLogSchema },
      { name: ScrapLogRecords.name, schema: ScrapLogRecordsSchema },
    ]),
  ],
  providers: [ScrapStatusService],
  controllers: [ScraplogController],
  exports: [ScrapStatusService],
})
export class ScrapStatusModule {}
