import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ScrapperStatus } from '../interfaces/scraper-status.interface';

export type ScrapperLogDocument = HydratedDocument<ScrapperLog>;

@Schema()
export class ScrapperLog {
  @Prop({ required: true })
  status: ScrapperStatus

  @Prop({ required: true })
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const ScrapperLogSchema = SchemaFactory.createForClass(ScrapperLog);