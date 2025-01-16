import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { RealEstates } from './schemas/realestate.schema';
import { CreateRealEstateDto } from './dto';

@Injectable()
export class RealestateService {
    constructor(@InjectModel(RealEstates.name) private scraperLogModel: Model<RealEstates>) {}

    async createProperty(property: CreateRealEstateDto) {
        const createdProperty = new this.scraperLogModel(property);
        await createdProperty.save();
        return null;
    }

    async updateProperty(property: CreateRealEstateDto) {
        const foundProperty = await this.findProperty(property);
        if (foundProperty) await this.scraperLogModel.findByIdAndUpdate(foundProperty.id, property, { new: true });
        return null;
    }

    private async findProperty(property: CreateRealEstateDto) {
        return await this.scraperLogModel.findOne({
            ProperyId: property.ProperyId,
            SourceType: property.SourceType,
        });
    }

    async createMany(properties: CreateRealEstateDto[]) {
        for (const property of properties) {
            const foundProperty = await this.findProperty(property);

            if (foundProperty) {
                await this.scraperLogModel.findByIdAndUpdate(foundProperty.id, property, { new: true });
            } else {
                await this.createProperty(property);
            }
        }
        return null;
    }
}
