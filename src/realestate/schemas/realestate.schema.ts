import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ListeningType, PropertyType, SourceType } from '../interfaces/realestate.interface';

export type RealEstatesDocument = HydratedDocument<RealEstates>;

@Schema()
export class RealEstates {
  @Prop({ required: true, index: true })
  ProperyId: string;

  @Prop({ required: true })
  City: string;

  @Prop({ required: true })
  Link: string;

  @Prop({ required: true, index: true })
  SourceType: SourceType;

  @Prop({required: true})
  ListeningType: ListeningType;

  @Prop({required: true})
  LastScrapedAt: number;

  @Prop()
  LocationCoords: string;

  @Prop({required: true})
  Location: string;

  @Prop({required: true})
  Microlocation: string;

  @Prop()
  Street: string;

  @Prop()
  Area: number;

  @Prop()
  Rooms: number;

  @Prop()
  Floor: string;

  @Prop()
  TotalFloors: number;

  @Prop({required: true})
  PropertyType: PropertyType;

  @Prop({required: true})
  Price: number;

  @Prop()
  AdditionalInfo: string[];

  @Prop()
  ImgLinks: string[];

  @Prop()
  Description: string;
}

export const RealEstatesSchema = SchemaFactory.createForClass(RealEstates);