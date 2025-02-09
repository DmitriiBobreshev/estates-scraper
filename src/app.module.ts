import 'dotenv/config';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';

import { ScrapStatusModule } from './scraplog/scraplog.module';
import { CronController } from './cron/cron.controller';
import { CronModule } from './cron/cron.module';
import { ScraplogController } from './scraplog/scraplog.controller';
import { ApikeyModule } from './apikey/apikey.module';

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } = process.env;

const connectionString = `mongodb://${MONGO_HOST}:${MONGO_PORT}`;
@Module({
  imports: [
    MongooseModule.forRoot(connectionString, {
      appName: MONGO_DB,
      dbName: MONGO_DB,
      authSource: 'admin',
      auth: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD
      }
    }),
    ScrapStatusModule,
    CronModule,
    ApikeyModule,
  ],
  controllers: [AppController, CronController, ScraplogController],
})
export class AppModule {}
