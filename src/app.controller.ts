import { Controller, Get, Param } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { ScrapStatusService } from './scraplog/scraplog.service';

@Controller()
export class AppController {
  constructor(
    private readonly scrapService: ScrapStatusService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Get()
  // async getAllStatuses() {
  //   const r = await this.scrapService.getAllStatuses();
  //   const f: any = r.map((s) => {
  //     return {
  //       id: s._id.toString(),
  //       status: s.status,
  //       scraperType: s.scraperType,
  //       createdAt: new Date(s.createdAt).toISOString(),
  //     };
  //   });

  //   return f;
  // }

  // @Get('/records')
  // async getStatus() {
  //   return await this.scrapService.getAllRecords();
  // }

  
}
