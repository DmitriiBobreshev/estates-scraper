import { Module } from '@nestjs/common';
import { ZidaService } from './zida.service';
import { ScrapStatusModule } from 'src/scraplog/scraplog.module';
import { UtilService } from 'src/common/providers/utils.service';
import { RealestateModule } from 'src/realestate/realestate.module';

@Module({
  imports: [ScrapStatusModule.register(), RealestateModule.register()],
  providers: [ZidaService, UtilService],
})
export class ZidaModule {}
