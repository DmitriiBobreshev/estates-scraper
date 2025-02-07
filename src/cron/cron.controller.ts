import { Controller, Get, Param } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Controller('cron')
export class CronController {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
  ) {}

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
        isRunning: cronJob.running,
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
