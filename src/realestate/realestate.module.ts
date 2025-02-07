import { DynamicModule, Module } from '@nestjs/common';
import { RealestateService } from './realestate.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RealEstates, RealEstatesSchema } from './schemas/realestate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RealEstates.name, schema: RealEstatesSchema },
    ]),
  ],
  providers: [RealestateService],
  exports: [RealestateService],
})
export class RealestateModule {}
