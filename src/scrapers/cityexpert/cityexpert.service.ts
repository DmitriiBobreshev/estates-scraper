import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UtilService } from 'src/common/providers/utils.service';
import { RealestateService } from 'src/realestate/realestate.service';
import { ScraperStatus, ScraperType, ScrapLogType } from 'src/scraplog/interfaces/scraperlog.interface';
import { ScrapStatusService } from 'src/scraplog/scraplog.service';
import { Cities, CitiesURIs, CityExpertRequest, PropType, rentOrSale, URIs } from './interfaces/cityexpert.interface';
import { CreateRealEstateDto } from 'src/realestate/dto';
import { ListeningType, PropertyType, SourceType } from 'src/realestate/interfaces/realestate.interface';

@Injectable()
export class CityexpertService {
  private logId: string;
  private isErrorHappened: boolean = false;
  private inProgress = false;
  private recordsParsed = 0;

  constructor(
    private readonly scrapService: ScrapStatusService,
    private readonly realEstateService: RealestateService,
    private readonly utilService: UtilService,
  ) { }

  // @TODO change on 12 hours
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: ScraperType.CityExpert,
    timeZone: 'Europe/Belgrade',
    disabled: true
  })
  async handleCron() {
    try {
      console.log('starat')
      if (this.inProgress) return;

      this.recordsParsed = 0;
      this.inProgress = true;
      await this.startScrap();
    } finally {
      // @TODO uncommit in prod
      // this.inProgress = false;
    }
  }

  async startScrap() {
    let status = ScraperStatus.Finished;
    const s = await this.scrapService.startScrap(ScraperType.CityExpert);
    this.logId = s._id.toString();
    await this.scrapAll();

    if (this.recordsParsed === 0) {
      status = ScraperStatus.NoRecordsAdded;
    } else if (this.isErrorHappened) {
      status = ScraperStatus.FinishedWithErrors;
    }
    await this.scrapService.finishScrap(this.logId, status);
  }

  private async getPropertyDetail(id: string, type: rentOrSale) {
    const url = `https://cityexpert.rs/api/PropertyView/${id}/${type}`;
    const res = await this.utilService.makeRequestWithRetries(url);
    if (!res) throw new Error('Failed to get property details for ' + url);

    return JSON.parse(res);
  }

  private async scrapAll() {
    return await Promise.all([
      this.scrapSingle(URIs.Rent, CitiesURIs.Beograd, rentOrSale.Rent),
      this.scrapSingle(URIs.Sale, CitiesURIs.Beograd, rentOrSale.Sale),

      this.scrapSingle(URIs.Rent, CitiesURIs.NoviSad, rentOrSale.Rent),
      this.scrapSingle(URIs.Sale, CitiesURIs.NoviSad, rentOrSale.Sale),

      this.scrapSingle(URIs.Rent, CitiesURIs.Nis, rentOrSale.Rent),
      this.scrapSingle(URIs.Sale, CitiesURIs.Nis, rentOrSale.Sale),
    ]);
  }

  private async scrapSingle(url: URIs, city: CitiesURIs, listeningType: rentOrSale) {
    const baseUrl = page => `${url}${city}?currentPage=${page}`;
    let page = 1;

    while (true) {
      try {
        const estates = await this.scrapPage(baseUrl(page), listeningType);
        page++;
        if (estates.length === 0) break;

        await this.realEstateService.createMany(estates);
        this.recordsParsed += estates.length;
      } catch (e) {
        this.isErrorHappened = true;
        this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, `Failed to scrap page ${url}, Error: ${e}`);
      }
    }
  }

  private async scrapPage(url: string, listeningType: rentOrSale): Promise<CreateRealEstateDto[]> {
    const resArr: CreateRealEstateDto[] = [];
    const cleanUrl = url.slice(0, url.indexOf('?')).replace(/https|http:\/\//, '');
    const page = await this.utilService.getHtmlFromUrl(url);
    const properties = [...page.querySelectorAll('app-property-card')]
      .map(e => {
        const ref = [...e.querySelectorAll('a')].find(e => e?.getAttribute('href')?.includes(cleanUrl));
        return ref?.getAttribute('href');
      });

    for (const propertyUrl of properties) {
      if (!propertyUrl) continue;
      try {
        const propertyDetails = await this.scrapProductDetails(propertyUrl, listeningType);
        resArr.push(propertyDetails);
      } catch (e) {
        this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, e.message);
      }
    }

    return resArr;
  }

  private async scrapProductDetails(propUrl: string, listeningType: rentOrSale): Promise<CreateRealEstateDto> {
    try {
      const property = new CreateRealEstateDto();
      const uArr = propUrl.split('/');
      const propId = uArr[uArr.length - 2];
      const json = await this.getPropertyDetail(propId, listeningType);

      property.ProperyId = json.propId;
      property.City = Cities[json.cityId];
      property.SourceType = SourceType.CityExpert;
      property.ListeningType = listeningType === rentOrSale.Rent ? ListeningType.Rent : ListeningType.Sale;
      property.LastScrapedAt = Date.now();
      property.Location = json.municipality;
      property.Microlocation = json.neighbourhoods.join(', ');
      property.PropertyType = json.ptId === PropType.Apartment ? PropertyType.Apartment : json.ptId === PropType.House ? PropertyType.House : PropertyType.Apartment;
      property.Price = json.price;
      property.LocationCoords = json.mapLat + ',' + json.mapLng;
      property.Street = json.street;
      property.Area = json.size;
      property.Rooms = parseFloat(json.structure);
      property.Floor = json.floor;
      property.AdditionalInfo = null;
      property.Description = null;
      property.ImgLinks = json.onsite.imgFiles.map((img: any) => `https://img.cityexpert.rs/sites/default/files/styles/720x/public/image/${img}`);
      property.Link = propUrl;

      return property;
    } catch (e) {
      throw new Error(`Failed to scrap product ${propUrl}, Error: ${e}`);
    }
  }
}
