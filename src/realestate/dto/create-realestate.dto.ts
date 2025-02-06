import {
  ListeningType,
  PropertyType,
  SourceType,
} from '../interfaces/realestate.interface';

export class CreateRealEstateDto {
  ProperyId: string;
  City: string;
  Link: string;
  SourceType: SourceType;
  ListeningType: ListeningType;
  LastScrapedAt: number;
  Location: string;
  Microlocation: string;
  PropertyType: PropertyType;
  Price: number;

  LocationCoords?: string;
  Street?: string;
  Area?: number;
  Rooms?: number;
  Floor?: string;
  TotalFloors?: number;
  AdditionalInfo?: string[];
  ImgLinks?: string[];
  Description: string;
}
