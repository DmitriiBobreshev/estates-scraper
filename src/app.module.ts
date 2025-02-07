import 'dotenv/config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';

import { HalooglasiModule } from './scrapers/halooglasi/halooglasi.module';
import { ScrapStatusModule } from './scraplog/scraplog.module';
import { ZidaModule } from './scrapers/zida/zida.module';
import { CityexpertModule } from './scrapers/cityexpert/cityexpert.module';
import { NekretnineModule } from './scrapers/nekretnine/nekretnine.module';

const connectionString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(connectionString),
    ScrapStatusModule.register(),

    // scap modules
    HalooglasiModule,
    ZidaModule,
    CityexpertModule,
    NekretnineModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
