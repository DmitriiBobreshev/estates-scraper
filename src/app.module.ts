import 'dotenv/config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';

import { ScrapStatusModule } from './scraplog/scraplog.module';
import { CronController } from './cron/cron.controller';
import { CronModule } from './cron/cron.module';
import { ScraplogController } from './scraplog/scraplog.controller';
import { ApikeyModule } from './apikey/apikey.module';

const connectionString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;

@Module({
  imports: [
    MongooseModule.forRoot(connectionString),
    ScrapStatusModule,
    CronModule,
    ApikeyModule,
  ],
  controllers: [AppController, CronController, ScraplogController],
})
export class AppModule {}
