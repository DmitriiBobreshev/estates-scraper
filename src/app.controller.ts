import { Controller, Get, Param } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { ScrapStatusService } from './scraplog/scraplog.service';
import { ScraperType } from './scraplog/interfaces/scraperlog.interface';
import { create } from 'domain';

@Controller()
export class AppController {
  constructor(
    private readonly scrapService: ScrapStatusService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  @Get()
  async getAllStatuses() {
    const r = await this.scrapService.getAllStatuses(); 
    const f: any = r.map(s => {
      return { 
        id: s._id.toString(),
        status: s.status,
        scraperType: s.scraperType,
        createdAt: new Date(s.createdAt).toISOString(),  
      };
    });

    return f; 
  }

  @Get('/records')
  async getStatus() {
    return await this.scrapService.getAllRecords();
  }

  @Get('/cron')
  async getCronTabJobs(): Promise<Array<object>> {
    const jobs = this.schedulerRegistry.getCronJobs();
    const res = [];
    for (const key of jobs.keys()) {
      const cronJob = jobs.get(key);
      res.push({
        name: key,
        cronTime: cronJob.cronTime.source,
        timeZone: cronJob.cronTime.timeZone,
        nexDate: cronJob.nextDate(),
        lastRun: cronJob.lastDate(),
        isRunning: cronJob.running
      });
    }
    return res;
  }

  @Get('/cron/start')
  async startCronTabForAll(): Promise<void> {
    const jobs = this.schedulerRegistry.getCronJobs();
    for (const job of jobs.values()) {
      job.runOnce = true;
      job.start();
    }
  }

  @Get('/cron/:id/start')
  async startCronTabForSpecificJob(@Param('id') id: string): Promise<void> {
    const jobs = this.schedulerRegistry.getCronJobs();
    const job = jobs.get(id);
    job.runOnce = true;
    job.start();
  }

  @Get('/cron/:id/stop')
  async stopCronTabForSpecificJob(@Param('id') id: string): Promise<void> {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.get(id)?.stop();
  }
}
