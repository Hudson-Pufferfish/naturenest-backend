import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = `postgresql://postgres:AMJsKiUpcOwvnysEjxinjWpccgsLFqER@autorack.proxy.rlwy.net:36845/naturenest`;
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
