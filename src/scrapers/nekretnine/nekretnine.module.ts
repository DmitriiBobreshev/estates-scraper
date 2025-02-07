import { Module } from '@nestjs/common';
import { NekretnineService } from './nekretnine.service';
import { ScrapStatusModule } from 'src/scraplog/scraplog.module';
import { RealestateModule } from 'src/realestate/realestate.module';
import { UtilService } from 'src/common/providers/utils.service';

@Module({
  imports: [ScrapStatusModule.register(), RealestateModule.register()],
  providers: [NekretnineService, UtilService]
})
export class NekretnineModule {}
