import { ListeningType, PropertyType, SourceType } from "../interfaces/realestate.interface";

export class CreateRealEstateDto {
  ProperyId: string;
  City: string;
  Link: string;
  SourceType: SourceType;
  ListeningType: ListeningType;
  LastScrappedAt: number;

  LocationCoords?: string;
  Location?: string;
  Microlocation?: string;
  Street?: string;
  Area?: number;
  Rooms?: number;
  Floor?: string;
  TotalFloors?: number;
  PropertyType?: PropertyType;
  Price?: number;
  AdditionalInfo?: string[];
}