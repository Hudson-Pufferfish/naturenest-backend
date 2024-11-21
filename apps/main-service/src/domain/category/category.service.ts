import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(private databaseService: DatabaseService) {}
  async onModuleInit() {
    const categories = await this.databaseService.category.findMany();
    if (categories.length > 0) return;
    await this.databaseService.category.createMany({
      data: [
        { name: 'farmhouse', description: 'farmhouse' },
        { name: 'cabin', description: 'cabin' },
        { name: 'airstream', description: 'airstream' },
        { name: 'tent', description: 'tent' },
        { name: 'warehouse', description: 'warehouse' },
        { name: 'yurt', description: 'yurt' },
        { name: 'safari_tent', description: 'safari_tent' },
        { name: 'converted_barn', description: 'converted_barn' },
      ],
    });
  }
  async findMany({ skip, take }: { skip: number; take: number }) {
    const categories = await this.databaseService.category.findMany({
      skip: skip || 0,
      take: take || 10,
    });
    return categories;
  }
}
