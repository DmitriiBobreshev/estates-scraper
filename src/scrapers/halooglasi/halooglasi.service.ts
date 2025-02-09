import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UtilService } from 'src/common/providers/utils.service';

import { ScrapStatusService } from 'src/scraplog/scraplog.service';
import {
  ScraperStatus,
  ScraperType,
  ScrapLogType,
} from 'src/scraplog/interfaces/scraperlog.interface';

import {
  ListeningType,
  PropertyType,
  SourceType,
} from 'src/realestate/interfaces/realestate.interface';
import {
  Defaults,
  HalooglasiSelectors,
  HalooglasiUrls,
} from './interfaces/halooglasi.interface';
import { CreateRealEstateDto } from 'src/realestate/dto';
import { RealestateService } from 'src/realestate/realestate.service';

@Injectable()
export class HalooglasiService {
  private logId: string;
  private isErrorHappened: boolean = false;
  private inProgress = false;
  private recordsParsed = 0;
  private readonly logger = new Logger(HalooglasiService.name, {
    timestamp: true,
  });

  constructor(
    private readonly scrapService: ScrapStatusService,
    private readonly realEstateService: RealestateService,
    private readonly utilService: UtilService,
  ) {}

  // @TODO change on 12 hours
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: ScraperType.Halooglasi,
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

    const s = await this.scrapService.startScrap(ScraperType.Halooglasi);
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
    return await Promise.all([
      this.scrapSingle(
        HalooglasiUrls.ApartmentSale,
        PropertyType.Apartment,
        ListeningType.Sale,
      ),
      this.scrapSingle(
        HalooglasiUrls.ApartmentRent,
        PropertyType.Apartment,
        ListeningType.Rent,
      ),
      this.scrapSingle(
        HalooglasiUrls.HouseSale,
        PropertyType.House,
        ListeningType.Sale,
      ),
      this.scrapSingle(
        HalooglasiUrls.HouseRent,
        PropertyType.House,
        ListeningType.Rent,
      ),
    ]);
  }

  private async scrapSingle(
    baseUrl: string,
    propType: PropertyType,
    listeningType: ListeningType,
  ) {
    let page = 1;
    while (true) {
      const url = `${baseUrl}?page=${page}`;

      try {
        const estates = await this.scrapPage(url);
        if (estates.length === 0) break;
        page++;

        const specifiedEstates = estates.map((e) => {
          e.PropertyType = propType;
          e.ListeningType = listeningType;
          e.LastScrapedAt = Date.now();
          return e;
        });

        await this.realEstateService.createMany(specifiedEstates);
        this.recordsParsed += specifiedEstates.length;
        this.logger.verbose(
          `Scrapped ${specifiedEstates.length} records for ${propType} ${listeningType}`,
        );
      } catch (e) {
        this.isErrorHappened = true;
        this.logger.error(
          `Failed to scrap page ${url} for ${propType} ${listeningType}, Error: ${e}`,
        );
        this.scrapService.logScrapRecord(
          this.logId,
          ScrapLogType.Error,
          `Failed to scrap page ${url} for ${propType} ${listeningType}, Error: ${e}`,
        );
      }
    }
  }

  private async scrapPage(pageUrl: string): Promise<CreateRealEstateDto[]> {
    const resArr: CreateRealEstateDto[] = [];
    const page = await this.utilService.getHtmlFromUrl(pageUrl);
    const products = page.querySelectorAll(HalooglasiSelectors.ProductSelector);

    for (const product of products) {
      const href = product.getAttribute('href');
      const url = this.utilService.getConcatedUrl(pageUrl, href);

      try {
        const estate = await this.scrapProductDetails(url);
        await this.utilService.delayRandom(1000);
        resArr.push(estate);
      } catch (e) {
        this.isErrorHappened = true;

        this.logger.error(`Failed to scrap product ${url}, Error: ${e}`);
        this.scrapService.logScrapRecord(
          this.logId,
          ScrapLogType.Error,
          `Failed to scrap product ${url}, Error: ${e}`,
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
    const property = new CreateRealEstateDto();
    const productJson = await this.getProductJson(productUrl);
    property.ProperyId = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyIdSelector,
      Defaults.StringDefault,
    );
    property.City = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyCitySelector,
      Defaults.StringDefault,
    );
    property.Link = productUrl;
    property.SourceType = SourceType.Halooglasi;

    property.LocationCoords = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyLocationCoordsSelector,
      Defaults.StringDefault,
    );
    property.Location = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyLocationSelector,
      Defaults.StringDefault,
    );
    property.Microlocation = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyMicrolocationSelector,
      Defaults.StringDefault,
    );
    property.Street = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyStreetSelector,
      Defaults.StringDefault,
    );
    property.Area = this.utilService.getDataFromJsonString<number>(
      productJson,
      HalooglasiSelectors.PropertyAreaSelector,
      Defaults.NumberDefault,
    );
    property.Rooms = this.utilService.getDataFromJsonString<number>(
      productJson,
      HalooglasiSelectors.PropertyRoomsSelector,
      Defaults.NumberDefault,
    );
    property.Floor = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyFloorSelector,
      Defaults.StringDefault,
    );
    property.TotalFloors = this.utilService.getDataFromJsonString<number>(
      productJson,
      HalooglasiSelectors.PropertyTotalFloorsSelector,
      Defaults.NumberDefault,
    );
    property.Price = this.utilService.getDataFromJsonString<number>(
      productJson,
      HalooglasiSelectors.PropertyPriceSelector,
      Defaults.NumberDefault,
    );
    property.AdditionalInfo = this.utilService.getDataFromJsonString<string[]>(
      productJson,
      HalooglasiSelectors.PropertyAdditionalInfoSelector,
      [],
    );
    property.ImgLinks = this.utilService
      .getDataFromJsonString<
        string[]
      >(productJson, HalooglasiSelectors.PropertyImageLinksSelector, [])
      .map((l) =>
        this.utilService.getConcatedUrl(HalooglasiUrls.ImageLinkUrl, l),
      );
    property.Description = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyDescriptionSelector,
      Defaults.StringDefault,
    );
    const validFrom = this.utilService.getDataFromJsonString<string>(
      productJson,
      HalooglasiSelectors.PropertyFirstPublishedAtSelector,
      Defaults.StringDefault,
    );
    property.FirstPublishedAt = new Date(validFrom).getTime() || 0;

    return property;
  }

  /**
   * Get product json from product page
   * @param productUrl product page url
   * @returns product json
   * @throws error if failed to get product json
   * */
  private async getProductJson(productUrl: string): Promise<string> {
    const product = await this.utilService.getHtmlFromUrl(productUrl);
    const scripts = product.querySelectorAll('script');
    const script = scripts.find((s) =>
      s.text.includes(HalooglasiSelectors.ScriptSearchingString),
    );
    return this.getJsonFromScript(script.textContent);
  }

  /**
   * Get json from script
   * @param script script text
   * @returns json string
   * */
  private getJsonFromScript(script: string) {
    const start = script.indexOf(HalooglasiSelectors.ScriptSearchingString);
    const end = script.indexOf('};', start);
    return script.slice(
      start + HalooglasiSelectors.ScriptSearchingString.length,
      end + 1,
    );
  }
}
