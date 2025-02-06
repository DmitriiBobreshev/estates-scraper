import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ScraperStatus, ScraperType } from '../interfaces/scraperlog.interface';

export type ScraperLogDocument = HydratedDocument<ScrapStatusLog>;

@Schema()
export class ScrapStatusLog {
  @Prop({ required: true })
  status: ScraperStatus;

  @Prop({ required: true })
  scraperType: ScraperType;

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const ScraperLogSchema = SchemaFactory.createForClass(ScrapStatusLog);
