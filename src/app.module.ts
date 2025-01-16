import 'dotenv/config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';

import { HalooglasiModule } from './scrapers/halooglasi/halooglasi.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapStatusModule } from './scraplog/scraplog.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ScrapStatusModule.register(),
    HalooglasiModule
  ],
  controllers: [AppController]
})
export class AppModule {}
