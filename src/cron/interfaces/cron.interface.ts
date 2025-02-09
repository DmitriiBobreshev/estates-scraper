export interface Cron {}

export interface Empty {}

export interface CronJob {
  name: string,
  cronTime: string,
  timeZone: string,
  nexDate: string,
  lastRun: string,
  isRunning: boolean,
}

export interface StatusMessage {
  status: boolean;
  statusText: string;
}

export interface JobMessage {
  id: string;
}