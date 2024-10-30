import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
@Controller('/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Get()
  find(@Query('skip') skip: number, @Query('take') take: number) {
    return this.categoryService.findMany({ skip, take });
  }
}