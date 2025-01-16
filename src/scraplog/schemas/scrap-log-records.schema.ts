import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ScrapLogType } from '../interfaces/scraperlog.interface';

export type ScrapLogRecordsDocument = HydratedDocument<ScrapLogRecords>;

@Schema()
export class ScrapLogRecords {
  @Prop({ required: true, index: true })
  scraperId: string;

  @Prop({ required: true })
  type: ScrapLogType;

  @Prop()
  message: string;

  @Prop({ required: true })
  createdAt: number;
}

export const ScrapLogRecordsSchema = SchemaFactory.createForClass(ScrapLogRecords);