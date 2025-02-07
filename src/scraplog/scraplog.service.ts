import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { ScrapStatusLog } from './schemas/scrap-status.schema';
import { InjectModel } from '@nestjs/mongoose';

import { CreateStatusRecordDto, UpdateStatusRecordDto } from './dto';
import {
  ScraperStatus,
  ScraperType,
  ScrapLogType,
} from './interfaces/scraperlog.interface';
import { ScrapLogRecords } from './schemas/scrap-log-records.schema';
import { CreateScrapLogRecordDto } from './dto/craete-scrap-log-record.dto';

@Injectable()
export class ScrapStatusService {
  private readonly logger = new Logger(ScrapStatusService.name);

  constructor(
    @InjectModel(ScrapStatusLog.name)
    private scraperLogModel: Model<ScrapStatusLog>,
    @InjectModel(ScrapLogRecords.name)
    private scraperLogRecordsModel: Model<ScrapLogRecords>,
  ) {}

  async startScrap(scraperType: ScraperType) {
    const record = new CreateStatusRecordDto();
    record.status = ScraperStatus.InProgress;
    record.createdAt = Date.now();
    record.scraperType = scraperType;

    return await this.scraperLogModel.create(record);
  }

  async finishScrap(id: string, status: ScraperStatus) {
    const record = new UpdateStatusRecordDto();
    record.status = status;
    record.updatedAt = Date.now();
    return await this.scraperLogModel.findByIdAndUpdate(id, record, { new: true });
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
      this.logger.error(
        `Failed to log scrap record: ${error}, message: ${message}`,
      );
    }
  }

  async getStatuses(dateFrom?: number, dateTo?: number) {
    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) createdAt['$gte'] = dateFrom;
      if (dateTo) createdAt['$lte'] = dateTo;

      return await this.scraperLogModel.find({
        createdAt: { $gte: dateFrom, $lte: dateTo },
      }).sort({ createdAt: -1 });
    } 

    return await this.scraperLogModel.find({
    }).sort({ createdAt: -1 });
  }

  async getAllRecords() {
    const res = await this.scraperLogRecordsModel
      .find()
      .sort({ createdAt: -1 });
    return res;
  }

  async getRecordByJobId(jobId: string) {
    const res = await this.scraperLogRecordsModel
      .find({
        scraperId: jobId,
      })
      .sort({ createdAt: -1 });
    return res;
  }
}
