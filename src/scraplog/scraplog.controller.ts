import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScrapStatusService } from './scraplog.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { GetJobsRequest, GetJobsResponse, LogRecord, RecordIdRequest } from './interfaces/scraperlog.interface';

@Controller('scraplog')
export class ScraplogController {
  constructor(
    private scrapService: ScrapStatusService,
  ) { }

  @GrpcMethod('ScrapLogService', 'GetJobs')
  GetJobs(jobRequest: GetJobsRequest): Observable<GetJobsResponse> {
    const job$ = new Subject<GetJobsResponse>();

    const { dateFrom, dateTo } = jobRequest;
    const dateFromNum = new Date(dateFrom).getTime() || null;
    const dateToNum = new Date(dateTo).getTime() || null;

    this.scrapService.getStatuses(dateFromNum, dateToNum)
    .then((res) => {
      res.forEach((s) => {
        job$.next({
          id: s._id.toString(),
          status: s.status,
          scraperType: s.scraperType,
          createdAt: new Date(s.createdAt).toISOString(),
        })
      });
      job$.complete();
    });

    return job$.asObservable();
  }

  @GrpcMethod('ScrapLogService', 'GetAllRecords')
  GetAllRecords(): Observable<LogRecord> {
    const job$ = new Subject<LogRecord>();
    this.scrapService.getAllRecords()
    .then((res) => {
      res.forEach((r) => {
        job$.next({
          recordId: r.id,
          jobId: r.scraperId,
          type: r.type,
          message: r.message,
          createdAt: new Date(r.createdAt).toISOString(),
        });
      });
      job$.complete();
    });

    return job$.asObservable();
  }

  @GrpcMethod('ScrapLogService', 'GetRecordByJobId')
  GetRecordByJobId(data: RecordIdRequest): Observable<LogRecord> {
    const job$ = new Subject<LogRecord>();
    this.scrapService.getRecordByJobId(data.JobId)
    .then((res) => {
      res.forEach((r) => {
        job$.next({
          recordId: r.id,
          jobId: r.scraperId,
          type: r.type,
          message: r.message,
          createdAt: new Date(r.createdAt).toISOString(),
        });
      });
      job$.complete();
    });

    return job$.asObservable();
  }
}
