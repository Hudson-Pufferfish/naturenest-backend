import { UserService } from './user.service';
import { createTestingModule } from '../../test/test-utils';
import { MockContext } from '../../database/database.service.test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      UserService,
    ]);
    service = module.get<UserService>(UserService);
    mockContext = mc;
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.prisma.user.findUnique.mockResolvedValue(null);
      mockContext.prisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.create({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        password2: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if email exists', async () => {
      // Arrange
      mockContext.prisma.user.findUnique.mockResolvedValue({
        id: 'existingUser',
        email: 'test@example.com',
        username: 'existinguser',
        password: 'hashedpass',
        firstName: 'Existing',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(
        service.create({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          password2: 'password123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid data', async () => {
      // Arrange
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpass',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockContext.prisma.user.update.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.resetPassword({
        email: 'test@example.com',
        username: 'testuser',
        newPassword: 'newpassword',
        confirmNewPassword: 'newpassword',
      });

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      mockContext.prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.resetPassword({
          email: 'nonexistent@example.com',
          username: 'testuser',
          newPassword: 'newpassword',
          confirmNewPassword: 'newpassword',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
