import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { createTestingModule } from '../../test/test-utils';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    userService = {
      findOneOrFailByEmail: jest.fn(),
      comparePassword: jest.fn(),
      create: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    const { module } = await createTestingModule([
      AuthService,
      {
        provide: UserService,
        useValue: userService,
      },
      {
        provide: JwtService,
        useValue: jwtService,
      },
    ]);

    service = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.findOneOrFailByEmail.mockResolvedValue(mockUser);
      userService.comparePassword.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mock.jwt.token');

      // Act
      const result = await service.signIn('test@example.com', 'password123');

      // Assert
      expect(result).toEqual({
        jwt: 'mock.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.findOneOrFailByEmail.mockResolvedValue(mockUser);
      userService.comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      // Arrange
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };

      userService.create.mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jwtService.signAsync.mockResolvedValue('mock.jwt.token');

      // Act
      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        password2: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      // Assert
      expect(result).toEqual({
        jwt: 'mock.jwt.token',
        user: mockUser,
      });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      // Act & Assert
      await expect(
        service.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          password2: 'differentpassword',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
