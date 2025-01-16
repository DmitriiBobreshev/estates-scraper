import { ScrapperStatus } from "../interfaces/scraper-status.interface";

export class UpdateRecordDto {
  status: ScrapperStatus
  createdAt: number;
  updatedAt: number;
}