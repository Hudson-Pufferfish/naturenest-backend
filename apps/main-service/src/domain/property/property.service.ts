import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(private databaseService: DatabaseService) {}

  async create(data: CreatePropertyDto) {
    // Validate category exists
    const category = await this.databaseService.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Category id ${data.categoryId} not found`);
    }

    // Validate amenities exist if provided
    if (data.amenityIds?.length) {
      const amenities = await this.databaseService.amenity.findMany({
        where: {
          id: {
            in: data.amenityIds,
          },
        },
      });

      if (amenities.length !== data.amenityIds.length) {
        const foundIds = amenities.map((a) => a.id);
        const notFoundIds = data.amenityIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `Amenities not found: ${notFoundIds.join(', ')}`,
        );
      }
    }

    return await this.databaseService.property.create({
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
        countryCode: data.countryCode,
        ...(data.amenityIds && {
          amenities: {
            connect: data.amenityIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async updateOrFailById(propertyId: string, data: UpdatePropertyDto) {
    await this.findOrFailById(propertyId);

    // Validate category exists if updating category
    if (data.categoryId) {
      const category = await this.databaseService.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category id ${data.categoryId} not found`,
        );
      }
    }

    // Validate amenities exist if updating amenities
    if (data.amenityIds?.length) {
      const amenities = await this.databaseService.amenity.findMany({
        where: {
          id: {
            in: data.amenityIds,
          },
        },
      });

      if (amenities.length !== data.amenityIds.length) {
        const foundIds = amenities.map((a) => a.id);
        const notFoundIds = data.amenityIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `Amenities not found: ${notFoundIds.join(', ')}`,
        );
      }
    }

    return this.databaseService.property.update({
      where: { id: propertyId },
      data: {
        ...data,
        ...(data.amenityIds && {
          amenities: {
            set: data.amenityIds.map((id) => ({ id })),
          },
        }),
      },
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
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        amenities: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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

    return {
      ...foundProperty,
      amenities: foundProperty.amenities || [],
    };
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

    const properties = await this.databaseService.property.findMany({
      where,
      skip: skip || 0,
      take: take || 10,
      include: {
        category: true,
        amenities: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return properties.map((property) => ({
      ...property,
      amenities: property.amenities || [],
    }));
  }

  async findAllByCreatorId(creatorId: string) {
    const properties = await this.databaseService.property.findMany({
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
        amenities: true,
      },
    });

    return properties.map((property) => ({
      ...property,
      amenities: property.amenities || [],
    }));
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

    const properties = await this.databaseService.property.findMany({
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
        countryCode: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        amenities: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return properties.map((property) => ({
      ...property,
      amenities: property.amenities || [],
    }));
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
        countryCode: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        amenities: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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

    return {
      ...property,
      amenities: property.amenities || [],
    };
  }

  async findAllByCreatorIdWithFullDetails(
    creatorId: string,
    skip?: number,
    take?: number,
  ) {
    const properties = await this.databaseService.property.findMany({
      where: {
        creatorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip || 0,
      take: take || 10,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        amenities: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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

    return properties.map((property) => ({
      ...property,
      amenities: property.amenities || [],
    }));
  }
}
