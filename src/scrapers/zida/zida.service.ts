import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UtilService } from 'src/common/providers/utils.service';

import { ScrapStatusService } from 'src/scraplog/scraplog.service';
import { ScraperStatus, ScraperType, ScrapLogType } from 'src/scraplog/interfaces/scraperlog.interface';

import { ListeningType, PropertyType, SourceType } from 'src/realestate/interfaces/realestate.interface';
import { CreateRealEstateDto } from 'src/realestate/dto';
import { RealestateService } from 'src/realestate/realestate.service';
import { ZidaSelectors, ZidaUrls } from './interfaces/zida.interface';

@Injectable()
export class ZidaService {
    private logId: string;
    private isErrorHappened: boolean = false;
    private inProgress = false;
    private recordsParsed = 0;

    constructor(
        private readonly scrapService: ScrapStatusService,
        private readonly realEstateService: RealestateService,
        private readonly utilService: UtilService,
    ) {}
    
    // @TODO change on 12 hours
    @Cron(CronExpression.EVERY_5_SECONDS, {
        name: ScraperType.Zida,
        timeZone: 'Europe/Belgrade',
        disabled: true
    })
    async handleCron() {
        try {
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
        const s = await this.scrapService.startScrap(ScraperType.Zida);
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
            this.scrapSingle(ZidaUrls.ApartmentSale, PropertyType.Apartment, ListeningType.Sale),
            this.scrapSingle(ZidaUrls.ApartmentRent, PropertyType.Apartment, ListeningType.Rent),
            this.scrapSingle(ZidaUrls.HouseSale,     PropertyType.House,     ListeningType.Sale),
            this.scrapSingle(ZidaUrls.HouseRent,     PropertyType.House,     ListeningType.Rent),
        ]);
    }

    private async scrapSingle(baseUrl: string, propertyType: PropertyType, listeningType: ListeningType) {
        let page = 1;
        while (true) {
            let url = `${baseUrl}?strana=${page}`;

            try {
                const estates = await this.scrapPage(url);
                if (estates.length === 0) break;
                page++;
                
                const specifiedEstates = estates.map(e => {
                    e.PropertyType = propertyType;
                    e.ListeningType = listeningType;
                    e.LastScrapedAt = Date.now();
                    return e;
                });

                await this.realEstateService.createMany(specifiedEstates);
                this.recordsParsed += specifiedEstates.length;
            } catch (e) {
                this.isErrorHappened = true;
                this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, `Failed to scrap page ${url} for ${propertyType} ${listeningType}, Error: ${e}`);
            }
        }
    }

     private async scrapPage(pageUrl: string): Promise<CreateRealEstateDto[]> {
        const resArr: CreateRealEstateDto[] = [];
        const page = await this.utilService.getHtmlFromUrl(pageUrl);
        const titleLinks = [...page.querySelectorAll(ZidaSelectors.BookmarkSelector)]
            .map(e => e.closest(ZidaSelectors.DivSelector)
            .parentNode.querySelector(ZidaSelectors.LinkSelector));

        for (const product of titleLinks) {
            const href = product.getAttribute(ZidaSelectors.HrefAttribute);
            if (!href) continue;
            
            const url = this.utilService.getConcatedUrl(pageUrl, href);
            try {
                const estate = await this.scrapProductDetails(url);
                await this.utilService.delayRandom(1000);
                resArr.push(estate);
            } catch (e) {
                this.isErrorHappened = true;
                this.scrapService.logScrapRecord(this.logId, ScrapLogType.Error, `Failed to scrap product ${url}, Error: ${e}`);
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
        const content = await this.utilService.makeRequestWithRetries(productUrl);
        const page = this.utilService.getHtmlFromContent(content);
        try {
            // '1-etažna kuća za izdavanje, Stanovo, 1.500€, 240m²'
            const titleEl = page.querySelector(ZidaSelectors.TitleSelector).getAttribute(ZidaSelectors.ContentAttribute);
            const title = titleEl.split(',');
            const locations = [...page.querySelectorAll(ZidaSelectors.H1Selector)]
                .find(e => e.textContent.includes(titleEl))
                .closest(ZidaSelectors.DivSelector)
                .querySelector(ZidaSelectors.SpanSelector)
                .textContent 
                .split(',');

            const images = [...page.querySelectorAll(ZidaSelectors.ImageSelector)].map(e => e.getAttribute('src'));

            const property = new CreateRealEstateDto();
            property.ProperyId = productUrl.split('/').pop();
            property.City = locations[0] ?? null;
            property.Link = productUrl;
            property.SourceType = SourceType.Zida;
            
            property.Location = locations[1] ?? "unknown";
            property.Microlocation = locations[2] ?? "unknown";
            property.Street = locations[3] ?? null;
            property.Area = parseFloat(title[title.length - 1].trim());
            property.Price = parseFloat(title[title.length - 2].trim().replace(".", ''));
            property.ImgLinks = images;

            return property;
        } catch (e) {
            throw new Error(`Failed to scrap product ${productUrl}, Content: ${content} Error: ${e}`);
        }
    }

}
