import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CATEGORIES } from './category.config';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(private databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.syncCategories();
  }

  async syncCategories() {
    // Get existing categories
    const existingCategories = await this.databaseService.category.findMany();
    const existingNames = existingCategories.map((c) => c.name);

    // Filter out categories that already exist
    const categoriesToAdd = CATEGORIES.filter(
      (cat) => !existingNames.includes(cat.name),
    );

    // Add only new categories
    if (categoriesToAdd.length > 0) {
      await this.databaseService.category.createMany({
        data: categoriesToAdd,
      });
    }
  }

  async findMany({ skip, take }: { skip: number; take: number }) {
    const categories = await this.databaseService.category.findMany({
      skip: skip || 0,
      take: take || 10,
    });
    return categories;
  }
}
