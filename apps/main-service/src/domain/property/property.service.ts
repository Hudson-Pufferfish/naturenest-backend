import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

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

  async updateOrFailById(propertyId: string, data: UpdatePropertyDto) {
    await this.findOrFailById(propertyId);

    return this.databaseService.property.update({
      where: { id: propertyId },
      data,
    });
  }

  async deleteOrFailById(propertyId: string) {
    await this.findOrFailById(propertyId);

    return this.databaseService.property.delete({
      where: { id: propertyId },
    });
  }

  async findOrFailById(propertyId: string) {
    const foundProperty = await this.databaseService.property.findUnique({
      where: { id: propertyId },
    });

    if (!foundProperty) {
      throw new NotFoundException(`Property id ${propertyId} not found`);
    }

    return foundProperty;
  }

  async findMany({
    skip,
    take,
    categoryName,
  }: {
    skip?: number;
    take?: number;
    categoryName?: string;
  }) {
    const where = categoryName
      ? {
          category: {
            name: categoryName,
          },
        }
      : {};

    return this.databaseService.property.findMany({
      where,
      skip: skip || 0,
      take: take || 10,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async searchByName(name: string) {
    return this.databaseService.property.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async findAllByCreatorId(creatorId: string) {
    return this.databaseService.property.findMany({
      where: {
        creatorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
