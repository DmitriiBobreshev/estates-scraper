import { Module } from '@nestjs/common';
import { CityexpertService } from './cityexpert.service';
import { UtilService } from 'src/common/providers/utils.service';
import { ScrapStatusModule } from 'src/scraplog/scraplog.module';
import { RealestateModule } from 'src/realestate/realestate.module';

@Module({
  imports: [
    ScrapStatusModule.register(),
    RealestateModule.register(),
  ],
  providers: [CityexpertService, UtilService]
})
export class CityexpertModule { }
