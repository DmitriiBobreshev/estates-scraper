export enum CitiesURIs {
  Beograd = 'beograd',
  NoviSad = 'novi-sad',
  Nis = 'nis'
}

export enum URIs {
  Sale = "https://cityexpert.rs/prodaja-nekretnina/",
  Rent = "https://cityexpert.rs/izdavanje-nekretnina/",
  APIURI = "https://cityexpert.rs/api/PropertyView/"
}

export enum Cities {
  Beograd = 1,
  NoviSad = 2,
  Nis = 3
}
export enum PropType {
  Apartment = 1,
  House = 2,
  AppInHouse = 5,
}

export enum rentOrSale {
  Rent = 'r',
  Sale = 's'
};

export interface CityExpertRequest {
  ptId: PropType[];
  cityId: Cities;
  rentOrSale: rentOrSale;
  sort: 'datedsc',
  currentPage: number;
}
