export enum ScraperStatus {
  Finished = 'Finished',
  FinishedWithErrors = 'FinishedWithErrors',
  NoRecordsAdded = 'NoRecordsAdded',
  InProgress = 'InProgress',
}

export enum ScraperType {
  Halooglasi = 'Halooglasi',
  Nekretnine = 'Nekretnine',
  Zida = '4Zida',
  CityExpert = 'CityExpert',
}

export enum ScrapLogType {
  Info = 0,
  Warning = 1,
  Error = 2,
}

export interface GetJobsRequest {
  dateFrom: string;
  dateTo: string;
}

export interface GetJobsResponse {
  id: string;
  status: ScraperStatus;
  scraperType: ScraperType;
  createdAt: string;
}

export interface RecordIdRequest {
  JobId: string;
}

export interface LogRecord {
  recordId: string;
  jobId: string;
  type: any;
  message: string;
  createdAt: any;
}
