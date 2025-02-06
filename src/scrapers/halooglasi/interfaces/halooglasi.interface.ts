export enum HalooglasiSelectors {
  ProductSelector = 'div.product-list h3.product-title > a',
  ScriptSearchingString = 'QuidditaEnvironment.CurrentClassified=',
  PropertyIdSelector = '"Id"',
  PropertyCitySelector = '"grad_s"',
  PropertyLocationCoordsSelector = '"GeoLocationRPT"',
  PropertyLocationSelector = '"lokacija_s"',
  PropertyMicrolocationSelector = '"mikrolokacija_s"',
  PropertyStreetSelector = '"ulica_t"',
  PropertyAreaSelector = '"kvadratura_d"',
  PropertyRoomsSelector = '"broj_soba_s"',
  PropertyFloorSelector = '"sprat_s"',
  PropertyTotalFloorsSelector = '"sprat_od_s"',
  PropertyPriceSelector = '"cena_d"',
  PropertyAdditionalInfoSelector = '"dodatno_ss"',
  PropertyImageLinksSelector = '"ImageURLs"',
  PropertyDescriptionSelector = '"TextHtml"',
}

export enum HalooglasiUrls {
  ApartmentSale = 'https://www.halooglasi.com/nekretnine/prodaja-stanova',
  ApartmentRent = 'https://www.halooglasi.com/nekretnine/izdavanje-stanova',
  HouseSale = 'https://www.halooglasi.com/nekretnine/prodaja-kuca',
  HouseRent = 'https://www.halooglasi.com/nekretnine/izdavanje-kuca',
  ImageLinkUrl = 'https://img.halooglasi.com',
}

export enum Defaults {
  StringDefault = '',
  NumberDefault = 0,
}
