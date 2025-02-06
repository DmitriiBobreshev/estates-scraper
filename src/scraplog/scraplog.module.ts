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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScrapStatusLog.name, schema: ScraperLogSchema },
      { name: ScrapLogRecords.name, schema: ScrapLogRecordsSchema },
    ]),
  ],
})
export class ScrapStatusModule {
  static register(): DynamicModule {
    return {
      module: ScrapStatusModule,
      providers: [ScrapStatusService],
      exports: [ScrapStatusService],
    };
  }
}
