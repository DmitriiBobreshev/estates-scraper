export enum URIs {
  BaseUrl = 'https://www.nekretnine.rs',
  Houses = 'https://www.nekretnine.rs/stambeni-objekti/kuce/lista/po-stranici/20/',
  Apartments = 'https://www.nekretnine.rs/stambeni-objekti/stanovi/lista/po-stranici/20/',
}

export enum NekretnineSelectors {
  AdvertList = 'div.advert-list',
  Offers = 'div.row.offer',
  Link = 'a',
  Details = 'section[id="detalji"] div.property__amenities > ul > li',
  Location = 'section[id="lokacija"] div.property__location ul li',
  Price = 'h4.stickyBox__price',
  Description = 'div.property__description',
  Images = 'div.gallery-main-thumbs img',
  Script = 'script'
}

export enum Props {
  Transaction = 'transakcija',
  Sell = 'Prodaja',
  Area = 'kvadratura',
  ProbableArea = 'korisna površina do',
  Rooms = 'broj soba',
  Floor = 'spratnost',
  TotalFloors = 'broj spratova',
  Lat = 'ppLat',
  Lng = 'ppLng',
}