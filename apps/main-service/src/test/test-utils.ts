import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import {
  createMockContext,
  MockContext,
} from '../database/database.service.test';

export const createTestingModule = async (providers: any[]) => {
  let mockContext: MockContext;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: DatabaseService,
        useFactory: () => {
          mockContext = createMockContext();
          return mockContext.prisma;
        },
      },
    ],
  }).compile();

  return { module, mockContext };
};
