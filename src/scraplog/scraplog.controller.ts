import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScrapStatusService } from './scraplog.service';

@Controller('scraplog')
export class ScraplogController {
  constructor(
    private scrapService: ScrapStatusService,
  ) {}

  @Get('jobs')
  async getJobs(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Array<object>> {
    const dateFromNum = new Date(dateFrom).getTime() || null;
    const dateToNum = new Date(dateTo).getTime() || null;

    const r = await this.scrapService.getStatuses(dateFromNum, dateToNum);
    const f: any = r.map((s) => {
      return {
        id: s._id.toString(),
        status: s.status,
        scraperType: s.scraperType,
        createdAt: new Date(s.createdAt).toISOString(),
      };
    });

    return f;
  }

  @Get('records')
  async getAllRecords() {
    return await this.scrapService.getAllRecords();
  }

  @Get('records/:JobId')
  async getRecordByJobId(
    @Param('JobId') JobId: string,
  ) {
    return await this.scrapService.getRecordByJobId(JobId);
  }
}
