import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  CronJob,
  JobMessage,
  StatusMessage,
} from './interfaces/cron.interface';
import { Observable, Subject } from 'rxjs';
import { ApiKeyGuard } from 'src/apikey/apikey.guard';

import { CronTime } from "cron";

@UseGuards(ApiKeyGuard)
@Controller('cron')
export class CronController {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @GrpcMethod('CronService', 'GetCronTabJobs')
  GetCronTabJobs(): Observable<CronJob> {
    const job$ = new Subject<CronJob>();
    const jobs = this.schedulerRegistry.getCronJobs();

    setTimeout(() => {
      for (const key of jobs.keys()) {
        const cronJob = jobs.get(key);
        const job = {
          name: key,
          cronTime: cronJob.cronTime.source.toString(),
          timeZone: cronJob.cronTime.timeZone,
          nexDate: cronJob.nextDate()?.toString(),
          lastRun: cronJob.lastDate()?.toString(),
          isRunning: cronJob.running,
        };

        job$.next(job);
      }
      job$.complete();
    });

    return job$.asObservable();
  }

  @GrpcMethod('CronService', 'StartCronTabForAll')
  StartCronTabForAll(): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      for (const job of jobs.values()) {
        job.start();
      }

      return {
        status: true,
        statusText: 'All jobs started',
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }

  @GrpcMethod('CronService', 'StopCronTabForAll')
  StopCronTabForAll(): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      for (const job of jobs.values()) {
        job.stop();
      }

      return {
        status: true,
        statusText: 'All jobs started',
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }

  @GrpcMethod('CronService', 'StartCronTabForSpecificJob')
  StartCronTabForSpecificJob(data: JobMessage): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      const job = jobs.get(data.cronJobId);
      if (!job) throw Error('Job not found');
      job.start();

      return {
        status: true,
        statusText: `Jobs ${data.cronJobId} started`,
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }

  @GrpcMethod('CronService', 'StopCronTabForSpecificJob')
  StopCronTabForSpecificJob(data: JobMessage): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      const job = jobs.get(data.cronJobId);
      if (!job) throw Error('Job not found');

      job.stop();

      return {
        status: true,
        statusText: `Jobs ${data.cronJobId} stopped`,
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }

  @GrpcMethod('CronService', 'ForceRunAllJobs')
  ForceRunAllJobs(): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      for (const job of jobs.values()) {
        job.fireOnTick();
      }

      return {
        status: true,
        statusText: 'All jobs started',
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }

  @GrpcMethod('CronService', 'ForceRunOneJob')
  ForceRunOneJob(data: JobMessage): StatusMessage {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      const job = jobs.get(data.cronJobId);
      if (!job) throw Error('Job not found');

      job.fireOnTick();

      return {
        status: true,
        statusText: `Jobs ${data.cronJobId} started`,
      };
    } catch (error) {
      return {
        status: false,
        statusText: error.message,
      };
    }
  }
}
