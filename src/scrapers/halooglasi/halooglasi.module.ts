import { Module } from '@nestjs/common';
import { HalooglasiService } from './halooglasi.service';
import { ScrapStatusModule } from 'src/scraplog/scraplog.module';
import { UtilService } from 'src/common/providers/utils.service';
import { RealestateModule } from 'src/realestate/realestate.module';

@Module({
  imports: [ScrapStatusModule, RealestateModule],
  providers: [HalooglasiService, UtilService],
})
export class HalooglasiModule {}
