import { Module } from '@nestjs/common';
import { HalooglasiService } from './halooglasi.service';
import { ScrapStatusModule } from 'src/scraplog/scraplog.module';
import { HalooglasiController } from './halooglasi.controller';
import { UtilService } from 'src/common/providers/utils.service';
import { RealestateModule } from 'src/realestate/realestate.module';

@Module({
    imports: [
        ScrapStatusModule.register(),
        RealestateModule.register(),
    ],
    providers: [HalooglasiService, UtilService],
    controllers: [HalooglasiController],
})
export class HalooglasiModule {}
