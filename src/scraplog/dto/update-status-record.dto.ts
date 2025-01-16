import { ScraperStatus } from "../interfaces/scraperlog.interface";

export class UpdateStatusRecordDto {
  status: ScraperStatus;
  createdAt: number;
  updatedAt: number;
}