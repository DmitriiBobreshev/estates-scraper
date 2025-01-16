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
  LastScrappedAt: number;

  @Prop()
  LocationCoords: string;

  @Prop()
  Location: string;

  @Prop()
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

  @Prop()
  PropertyType: PropertyType;

  @Prop()
  Price: number;

  @Prop()
  AdditionalInfo: string[];
}

export const RealEstatesSchema = SchemaFactory.createForClass(RealEstates);