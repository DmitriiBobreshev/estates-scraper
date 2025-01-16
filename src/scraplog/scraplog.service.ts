import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { ScrapStatusLog } from './schemas/scrap-status.schema';
import { InjectModel } from '@nestjs/mongoose';

import { CreateStatusRecordDto, UpdateStatusRecordDto } from './dto';
import { ScraperStatus, ScraperType, ScrapLogType } from './interfaces/scraperlog.interface';
import { ScrapLogRecords } from './schemas/scrap-log-records.schema';
import { CreateScrapLogRecordDto } from './dto/craete-scrap-log-record.dto';

@Injectable()
export class ScrapStatusService {
  private readonly logger = new Logger(ScrapStatusService.name);

  constructor(
    @InjectModel(ScrapStatusLog.name) private scraperLogModel: Model<ScrapStatusLog>,
    @InjectModel(ScrapLogRecords.name) private scraperLogRecordsModel: Model<ScrapLogRecords>,
  ) { }

  startScrap(scraperType: ScraperType) {
    const record = new CreateStatusRecordDto();
    record.status = ScraperStatus.InProgress;
    record.createdAt = Date.now();
    record.scraperType = scraperType;

    return this.scraperLogModel.create(record);
  }

  finishScrap(id: string, isErrorHappened: boolean = false) {
    const record = new UpdateStatusRecordDto();
    record.status = isErrorHappened ? ScraperStatus.FinishedWithErrors : ScraperStatus.Finished;
    record.updatedAt = Date.now();
    return this.scraperLogModel.findByIdAndUpdate(id, record, { new: true });
  }

  async logScrapRecord(scraperId: string, type: ScrapLogType, message: string) {
    try {
      const record = new CreateScrapLogRecordDto();
      record.scraperId = scraperId;
      record.type = type;
      record.message = message;
      record.createdAt = Date.now();
      await this.scraperLogRecordsModel.create(record);
    } catch (error) {
      this.logger.error(`Failed to log scrap record: ${error}, message: ${message}`);
    }
  }

  async getLatestScrap() {
    return await this.scraperLogModel.find().sort({ createdAt: -1 }).limit(1);
  }
}
