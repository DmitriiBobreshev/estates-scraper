import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UtilService } from 'src/common/providers/utils.service';

import { ScrapStatusService } from 'src/scraplog/scraplog.service';
import { ScraperType, ScrapLogType } from 'src/scraplog/interfaces/scraperlog.interface';

import { ListeningType, PropertyType, SourceType } from 'src/realestate/interfaces/realestate.interface';
import { Defaults, HalooglasiSelectors, HalooglasiUrls } from './interfaces/halooglasi.interface';
import { CreateRealEstateDto } from 'src/realestate/dto';
import { RealestateService } from 'src/realestate/realestate.service';

@Injectable()
export class HalooglasiService {
    private logId: string;
    private isErrorHappened: boolean = false;

    constructor(
        private readonly scrapService: ScrapStatusService,
        private readonly realEstateService: RealestateService,
        private readonly utilService: UtilService,
    ) {}
    
    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCron() {
       
    }
 
    async startScrap() {
        const s = await this.scrapService.startScrap(ScraperType.Halooglasi);
        this.logId = s._id.toString();
        await this.scrapAll();
        await this.scrapService.finishScrap(this.logId, this.isErrorHappened);
    }

    private async scrapAll() {
        return await Promise.all([
            this.scrapSingle(HalooglasiUrls.ApartmentSale, PropertyType.Apartment, ListeningType.Sale),
            this.scrapSingle(HalooglasiUrls.ApartmentRent, PropertyType.Apartment, ListeningType.Rent),
            this.scrapSingle(HalooglasiUrls.HouseSale,     PropertyType.House,     ListeningType.Sale),
            this.scrapSingle(HalooglasiUrls.HouseRent,     PropertyType.House,     ListeningType.Rent),
        ]);
    }

    private async scrapSingle(baseUrl: string, propType: PropertyType, listeningType: ListeningType) {
        let page = 1;
        while (true) {
            let url = `${baseUrl}?page=${page}`;

            try {
                const estates = await this.scrapPage(url);
                if (estates.length === 0) break;
                page++;

                const specifiedEstates = estates.map(e => {
                    e.PropertyType = propType;
                    e.ListeningType = listeningType;
                    e.LastScrapedAt = Date.now();
                    return e;
                });
                
                await this.realEstateService.createMany(specifiedEstates);
            } catch (e) {
                this.isErrorHappened = true;
                this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, `Failed to scrap page ${page} for ${propType} ${listeningType}, Error: ${e}`);
            }
        }
    }

    private async scrapPage(pageUrl: string): Promise<CreateRealEstateDto[]> {
        const resArr: CreateRealEstateDto[] = [];
        const page = await this.utilService.getHtmlFromUrl(pageUrl);
        const products = page.querySelectorAll(HalooglasiSelectors.ProductSelector);

        for (const product of products) {
            try {
                const href = product.getAttribute('href');
                const url = this.utilService.getConcatedUrl(pageUrl, href);
                const estate = await this.scrapProductDetails(url);
                resArr.push(estate);
            } catch (e) {
                this.isErrorHappened = true;
                this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, `Failed to scrap product ${pageUrl}, Error: ${e}`);
            }
        }

        return resArr;
    }

    /**
     * Scrap product details from product page
     * @param productUrl product page url
     * @returns product details
     */
    private async scrapProductDetails(productUrl: string): Promise<CreateRealEstateDto> {
        const property = new CreateRealEstateDto();
        const productJson = await this.getProductJson(productUrl);
        property.ProperyId = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyIdSelector, Defaults.StringDefault);
        property.City = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyCitySelector, Defaults.StringDefault);
        property.Link = productUrl;
        property.SourceType = SourceType.Halooglasi;
        
        property.LocationCoords = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyLocationCoordsSelector, Defaults.StringDefault);
        property.Location = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyLocationSelector, Defaults.StringDefault);
        property.Microlocation = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyMicrolocationSelector, Defaults.StringDefault);
        property.Street = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyStreetSelector, Defaults.StringDefault);
        property.Area = this.utilService.getDataFromJsonString<number>(productJson, HalooglasiSelectors.PropertyAreaSelector, Defaults.NumberDefault);
        property.Rooms = this.utilService.getDataFromJsonString<number>(productJson, HalooglasiSelectors.PropertyRoomsSelector, Defaults.NumberDefault);
        property.Floor = this.utilService.getDataFromJsonString<string>(productJson, HalooglasiSelectors.PropertyFloorSelector, Defaults.StringDefault);
        property.TotalFloors = this.utilService.getDataFromJsonString<number>(productJson, HalooglasiSelectors.PropertyTotalFloorsSelector, Defaults.NumberDefault);
        property.Price = this.utilService.getDataFromJsonString<number>(productJson, HalooglasiSelectors.PropertyPriceSelector, Defaults.NumberDefault);
        property.AdditionalInfo = this.utilService.getDataFromJsonString<string[]>(productJson, HalooglasiSelectors.PropertyAdditionalInfoSelector, []);

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
        const script = scripts.find(s => s.text.includes(HalooglasiSelectors.ScriptSearchingString));
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
        return script.slice(start + HalooglasiSelectors.ScriptSearchingString.length, end + 1);
    }
}
