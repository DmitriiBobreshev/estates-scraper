import { ScraperStatus, ScraperType } from '../interfaces/scraperlog.interface';

export class CreateStatusRecordDto {
  status: ScraperStatus;
  scraperType: ScraperType;
  createdAt: number;
}
