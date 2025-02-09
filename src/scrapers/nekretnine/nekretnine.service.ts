import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UtilService } from 'src/common/providers/utils.service';
import { RealestateService } from 'src/realestate/realestate.service';
import { ScraperStatus, ScraperType, ScrapLogType } from 'src/scraplog/interfaces/scraperlog.interface';
import { ScrapStatusService } from 'src/scraplog/scraplog.service';
import { NekretnineSelectors, Props, URIs } from './interfaces/nekretnine.interface';
import { CreateRealEstateDto } from 'src/realestate/dto';
import { ListeningType, PropertyType, SourceType } from 'src/realestate/interfaces/realestate.interface';

@Injectable()
export class NekretnineService {
  private logId: string;
  private isErrorHappened: boolean = false;
  private inProgress = false;
  private recordsParsed = 0;
  private readonly logger = new Logger(ScraperType.Nekretnine, { timestamp: true });

  constructor(
    private readonly scrapService: ScrapStatusService,
    private readonly realEstateService: RealestateService,
    private readonly utilService: UtilService,
  ) { }

  // @TODO change on 12 hours
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: ScraperType.Nekretnine,
    timeZone: 'Europe/Belgrade',
    disabled: true,
  })
  async handleCron() {
    try {
      if (this.inProgress) {
        this.logger.warn('Cron job already in progress');
        return;
      }
      this.logger.log('Cron job started');

      this.recordsParsed = 0;
      this.inProgress = true;
      await this.startScrap();
    } catch (e) {
      this.logger.error('Error in cron job: ' + e);
    } finally {
      this.logger.log('Cron job finished');
      // @TODO uncommit in prod
      // this.inProgress = false;
    }
  }

  async startScrap() {
    let status = ScraperStatus.Finished;
    const s = await this.scrapService.startScrap(ScraperType.Nekretnine);
    this.logId = s._id.toString();
    await this.scrapAll();

    if (this.recordsParsed === 0) {
      status = ScraperStatus.NoRecordsAdded;
    } else if (this.isErrorHappened) {
      status = ScraperStatus.FinishedWithErrors;
    }
    await this.scrapService.finishScrap(this.logId, status);
  }

  private async scrapAll() {
    await Promise.all([
      this.scrapSingle(URIs.Apartments),
      this.scrapSingle(URIs.Houses)
    ]);
  }

  private async scrapSingle(startUri: URIs) {
    let page = 1;

    const getUri = (page: number) => `${startUri}/stranica/${page}/`;
    while (true) {
      try {
        const estates = await this.scrapPage(getUri(page));

        if (estates.length === 0) {
          this.logger.log(`No more estates on ${getUri(page)}`);
          break;
        }

        const estatesEnriched = estates.map(e => ({ ...e, PropertyType: URIs.Apartments === startUri ? PropertyType.Apartment : PropertyType.House }));
        page++;
        
        await this.realEstateService.createMany(estatesEnriched);

        this.recordsParsed += estatesEnriched.length;
        this.logger.verbose(
          `Scrapped ${estatesEnriched.length} records for ${startUri} page ${page}`,
        );
      } catch (e) {
        this.isErrorHappened = true;

        this.logger.error(
          `Failed to scrap page ${page} for ${startUri}, Error: ${e}`,
        );
        this.scrapService.logScrapRecord(
          this.logId,
          ScrapLogType.Error,
          `Failed to scrap page ${page} for ${startUri}, Error: ${e}`,
        );
      }
    }
  }

  private async scrapPage(pageUrl: string): Promise<CreateRealEstateDto[]> {
    const resArr: CreateRealEstateDto[] = [];
    const pageDocument = await this.utilService.getHtmlFromUrl(pageUrl);
    if (!pageDocument) return resArr;

    const propLinks = [...pageDocument
      .querySelector(NekretnineSelectors.AdvertList)
      .querySelectorAll(NekretnineSelectors.Offers)]
      .map(e => `${URIs.BaseUrl}${e.querySelector(NekretnineSelectors.Link).getAttribute('href')}`);

    for (const link of propLinks) {
      try {

        const scrapProductDetails = await this.scrapProductDetails(link);
        if (scrapProductDetails.Price) resArr.push(scrapProductDetails);
      } catch (e) {
        this.isErrorHappened = true;
        this.logger.error(`Failed to scrap product ${link}, Error: ${e}`);
        this.scrapService.logScrapRecord(
          this.logId,
          ScrapLogType.Error,
          `Failed to scrap product ${link}, Error: ${e}`,
        );
      }
    }

    return resArr;
  }

  /**
   * Scrap product details from product page
   * @param productUrl product page url
   * @returns product details
   */
  private async scrapProductDetails(
    productUrl: string,
  ): Promise<CreateRealEstateDto> {
    try {
      const property = new CreateRealEstateDto();

      const document = await this.utilService.getHtmlFromUrl(productUrl);
      const anamnesis = [...document.querySelectorAll(NekretnineSelectors.Details)].map(li => li.text.replace(/(\n|\s)+/g, " ").trim());
      const location = [...document.querySelectorAll(NekretnineSelectors.Location)].map(li => li.textContent.trim());
      const price = document.querySelector(NekretnineSelectors.Price).textContent.replace(/\s+/g, '');
      const description = document.querySelector(NekretnineSelectors.Description)?.textContent.replace(/(\n|\s)+/g, " ").trim();
      const imgs = [...document.querySelectorAll(NekretnineSelectors.Images)].map(img => img.getAttribute('src')).filter(e => !!e);

      const listeningType = this.getPropFromArr(anamnesis, Props.Transaction) === Props.Sell ? ListeningType.Sale : ListeningType.Rent;
      const area = this.getPropFromArr(anamnesis, Props.Area) || this.getPropFromArr(anamnesis, Props.ProbableArea);
      const rooms = this.getPropFromArr(anamnesis, Props.Rooms);
      const floor = this.getPropFromArr(anamnesis, Props.Floor);
      const totalFloors = this.getPropFromArr(anamnesis, Props.TotalFloors);
      const dates = [...document.querySelectorAll(NekretnineSelectors.Updated)].map(li => li.textContent.trim());
      const publishDate = this.getPropFromArr(dates, Props.Published);
     
      const coords = [...document.querySelectorAll(NekretnineSelectors.Script)]
        ?.find(s => s.text.includes(Props.Lat) || s.text.includes(Props.Lng))
        ?.textContent
        ?.split(',')
        ?.filter(c => c.includes(Props.Lat) || c.includes(Props.Lng))
        ?.map(c => c.split('=')[1].trim())
        ?.join(',');
      const splited = productUrl.split('/');

      property.ProperyId = splited[splited.length - 2];
      property.City = location[2] || location[1] || location[0] || "N/A";
      property.Link = productUrl; 
      property.SourceType = SourceType.Nekretnine;
      property.ListeningType = listeningType;
      property.LastScrapedAt = Date.now();
      property.LocationCoords = coords;
      property.Location = location[1] || location[0] || "N/A";
      property.Microlocation = location[3] ?? "N/A";
      property.Street = location[4] ?? "N/A";
      property.Area = parseFloat(area) || 0;
      property.Rooms = parseFloat(rooms) || 0;
      property.Floor = floor;
      property.TotalFloors = parseInt(totalFloors) || 0;
      property.Price = parseInt(price);
      property.ImgLinks = imgs;
      property.Description = description;

      if (publishDate) {
        const pDateArr = publishDate.split('.');
        const date = new Date();
        date.setFullYear(pDateArr[2]);
        date.setMonth(pDateArr[1] - 1);
        date.setDate(pDateArr[0]);
        property.FirstPublishedAt = date.getTime() || 0;
      } else {
        property.FirstPublishedAt = 0;
      }

      return property;
    } catch (e) {
      throw new Error(`Failed to scrap product ${productUrl}, Error: ${e}`);
    }
  }

  private getPropFromArr(arr, key) {
    return arr.find(a => a.toLocaleLowerCase().includes(key))?.split(':')[1].trim();
  }
}
