import { ScrapperStatus } from "../interfaces/scraper-status.interface";

export class CreateRecordDto {
  status: ScrapperStatus
  createdAt: number
}