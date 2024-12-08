import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AMENITIES } from './amenity.config';

@Injectable()
export class AmenityService implements OnModuleInit {
  constructor(private databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.syncAmenities();
  }

  async syncAmenities() {
    const existingAmenities = await this.databaseService.amenity.findMany();
    const existingNames = existingAmenities.map((a) => a.name);

    const amenitiesToAdd = AMENITIES.filter(
      (amenity) => !existingNames.includes(amenity.name),
    );

    if (amenitiesToAdd.length > 0) {
      await this.databaseService.amenity.createMany({
        data: amenitiesToAdd,
      });
    }
  }

  async findMany({ skip, take }: { skip?: number; take?: number }) {
    return this.databaseService.amenity.findMany({
      skip: skip || 0,
      take: take || 10,
    });
  }
}
