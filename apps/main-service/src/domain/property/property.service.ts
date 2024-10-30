import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePropertyDto } from './dto/create-property.dto';
@Injectable()
export class PropertyService {
  constructor(private databaseService: DatabaseService) {}
  create(data: CreatePropertyDto) {
    return this.databaseService.property.create({
      data: {
        name: data.name,
        tagLine: data.tagLine,
        description: data.description,
        price: data.price,
        coverUrl: data.coverUrl,
        guests: data.guests,
        bedrooms: data.bedrooms,
        beds: data.beds,
        baths: data.baths,
        categoryId: data.categoryId,
        creatorId: data.creatorId,
      },
    });
  }
}
