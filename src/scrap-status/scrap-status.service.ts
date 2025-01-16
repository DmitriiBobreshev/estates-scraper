import { Injectable } from '@nestjs/common';
import { ScrapperLog } from './schemas/scrapper-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRecordDto, UpdateRecordDto } from './dto';
import { ScrapperStatus } from './interfaces/scraper-status.interface';

@Injectable()
export class ScrapStatusService {
    constructor(@InjectModel(ScrapperLog.name) private scrapperLogModel: Model<ScrapperLog>) {}

    startScrap() {
        const record = new CreateRecordDto();
        record.status = ScrapperStatus.InProgress;
        record.createdAt = Date.now();
        const createdCat = new this.scrapperLogModel(record);
        return createdCat.save();
    }

    finishScrap(id: string) {
        const record = new UpdateRecordDto();
        record.status = ScrapperStatus.Finished;
        record.updatedAt = Date.now();
        return this.scrapperLogModel.findByIdAndUpdate(id, record, { new: true });
    }

    async getLatestScrap() {
        return await this.scrapperLogModel.find().sort({ createdAt: -1 }).limit(1);
    }
}
