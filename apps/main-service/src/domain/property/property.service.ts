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
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        reservations: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            numberOfGuests: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
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
    propertyName,
  }: {
    skip?: number;
    take?: number;
    categoryName?: string;
    propertyName?: string;
  }) {
    const where: any = {};

    if (categoryName) {
      where.category = {
        name: categoryName,
      };
    }

    if (propertyName) {
      where.name = {
        contains: propertyName,
        mode: 'insensitive',
      };
    }

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

  async findManyPublic({
    skip,
    take,
    categoryName,
    propertyName,
  }: {
    skip?: number;
    take?: number;
    categoryName?: string;
    propertyName?: string;
  }) {
    const where: any = {};

    if (categoryName) {
      where.category = {
        name: categoryName,
      };
    }

    if (propertyName) {
      where.name = {
        contains: propertyName,
        mode: 'insensitive',
      };
    }

    return this.databaseService.property.findMany({
      where,
      skip: skip || 0,
      take: take || 10,
      select: {
        id: true,
        name: true,
        tagLine: true,
        description: true,
        price: true,
        coverUrl: true,
        guests: true,
        bedrooms: true,
        beds: true,
        baths: true,
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async findPublicById(propertyId: string) {
    const property = await this.databaseService.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        tagLine: true,
        description: true,
        price: true,
        coverUrl: true,
        guests: true,
        bedrooms: true,
        beds: true,
        baths: true,
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property id ${propertyId} not found`);
    }

    return property;
  }

  async findAllByCreatorIdWithFullDetails(
    creatorId: string,
    skip?: number,
    take?: number,
  ) {
    return this.databaseService.property.findMany({
      where: {
        creatorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
        reservations: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            numberOfGuests: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
