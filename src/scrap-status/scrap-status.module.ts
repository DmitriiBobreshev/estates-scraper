import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScrapStatusService } from './scrap-status.service';
import { ScrapperLog, ScrapperLogSchema } from './schemas/scrapper-status.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ScrapperLog.name, schema: ScrapperLogSchema }])]
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
