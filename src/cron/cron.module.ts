import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CityexpertModule } from 'src/scrapers/cityexpert/cityexpert.module';
import { HalooglasiModule } from 'src/scrapers/halooglasi/halooglasi.module';
import { NekretnineModule } from 'src/scrapers/nekretnine/nekretnine.module';
import { ZidaModule } from 'src/scrapers/zida/zida.module';

@Module({
  imports: [
      ScheduleModule.forRoot(),
      
      // scap modules
      HalooglasiModule,
      ZidaModule,
      CityexpertModule,
      NekretnineModule,
  ]
})
export class CronModule {}
