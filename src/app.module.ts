import 'dotenv/config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';

import { HalooglasiModule } from './scrapers/halooglasi/halooglasi.module';
import { ScrapStatusModule } from './scraplog/scraplog.module';
import { ZidaModule } from './scrapers/zida/zida.module';
import { CityexpertModule } from './scrapers/cityexpert/cityexpert.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ScrapStatusModule.register(),

    // scap modules
    HalooglasiModule,
    ZidaModule,
    CityexpertModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
