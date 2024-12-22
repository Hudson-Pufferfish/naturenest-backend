# Real-world Examples from Our Codebase

This document provides detailed examples of unit tests from our NatureNest backend codebase, showing both the service code being tested and its corresponding test implementation. Each example demonstrates different aspects of testing and increases in complexity.

## 1. Authentication Service - JWT and Password Handling

### Service Code

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userService.findOneOrFailByEmail(email);

    // Verify password
    const isPasswordValid = await this.userService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const jwt = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // Return user data and token
    return {
      jwt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Validate passwords match
    if (dto.password !== dto.password2) {
      throw new BadRequestException('Passwords do not match');
    }

    // Create user
    const user = await this.userService.create(dto);

    // Generate JWT token
    const jwt = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // Return user data and token
    return {
      jwt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
```

### Test Code

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    // Setup mock services
    userService = {
      findOneOrFailByEmail: jest.fn(),
      comparePassword: jest.fn(),
      create: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    // Create testing module
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
        password: 'hashedPassword',
      };

      userService.findOneOrFailByEmail.mockResolvedValue(mockUser);
      userService.comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      userService.findOneOrFailByEmail.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      // Act & Assert
      await expect(
        service.signIn('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        password2: 'password123',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
      };

      const mockUser = {
        id: 'user1',
        ...registerDto,
        password: 'hashedPassword',
      };

      userService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock.jwt.token');

      // Act
      const result = await service.register(registerDto);

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

    it('should throw BadRequestException when passwords do not match', async () => {
      // Arrange
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        password2: 'differentpassword',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
      };

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
```

### Key Testing Points

1. **Dependency Mocking**

   - Mock both UserService and JwtService
   - Mock different responses for success/failure cases
   - Verify mock interactions

2. **Success and Failure Cases**

   - Test successful authentication
   - Test invalid credentials
   - Test user not found scenario
   - Test password mismatch during registration

3. **Error Handling**

   - Verify correct error types are thrown
   - Test error messages
   - Handle async errors properly

4. **Data Transformation**
   - Verify returned user object structure
   - Check JWT token generation
   - Validate data mapping

## 2. Reservation Service - Complex Business Logic

### Service Code

```typescript
// reservation.service.ts
@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly propertyService: PropertyService,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    // Get property details including existing reservations
    const property = await this.propertyService.findByIdWithFullDetails(
      dto.propertyId,
    );
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Validate guest count against property capacity
    if (dto.numberOfGuests > property.guests) {
      throw new BadRequestException(
        `Number of guests exceeds property capacity of ${property.guests}`,
      );
    }

    // Get overlapping reservations
    const overlappingReservations = await this.prisma.reservation.findMany({
      where: {
        propertyId: dto.propertyId,
        AND: [
          {
            startDate: {
              lte: dto.endDate,
            },
          },
          {
            endDate: {
              gte: dto.startDate,
            },
          },
        ],
      },
    });

    // Calculate total guests during the overlapping period
    const totalGuests = overlappingReservations.reduce(
      (sum, res) => sum + res.numberOfGuests,
      dto.numberOfGuests,
    );

    // Check if total guests exceed property capacity
    if (totalGuests > property.guests) {
      throw new BadRequestException(
        'Property is already booked to capacity for these dates',
      );
    }

    // Calculate total price based on number of nights
    const startDate = dayjs(dto.startDate);
    const endDate = dayjs(dto.endDate);
    const numberOfNights = endDate.diff(startDate, 'day');
    const totalPrice = numberOfNights * property.price;

    // Create the reservation
    return this.prisma.reservation.create({
      data: {
        ...dto,
        totalPrice,
      },
    });
  }
}
```

### Test Code

```typescript
// reservation.service.spec.ts
describe('ReservationService', () => {
  let service: ReservationService;
  let mockContext: MockContext;
  let propertyService: jest.Mocked<PropertyService>;

  const mockProperty = {
    id: 'prop1',
    name: 'Test Property',
    guests: 4,
    price: 100,
    creatorId: 'owner1',
    categoryId: 'cat1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    propertyService = {
      findByIdWithFullDetails: jest.fn(),
    } as any;

    const { module, mockContext: mc } = await createTestingModule([
      ReservationService,
      {
        provide: PropertyService,
        useValue: propertyService,
      },
    ]);

    service = module.get<ReservationService>(ReservationService);
    mockContext = mc;
  });

  describe('create', () => {
    it('should create a reservation with valid data', async () => {
      // Arrange
      const mockReservation = {
        id: 'res1',
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        totalPrice: 500, // 5 nights * $100
        numberOfGuests: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);
      mockContext.prisma.reservation.findMany.mockResolvedValue([]); // No overlapping reservations
      mockContext.prisma.reservation.create.mockResolvedValue(mockReservation);

      // Act
      const result = await service.create({
        propertyId: 'prop1',
        userId: 'user1',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        numberOfGuests: 3,
      });

      // Assert
      expect(result).toEqual(mockReservation);
    });

    it('should throw BadRequestException when overlapping reservations exceed property capacity', async () => {
      // Arrange
      const existingReservations = [
        {
          id: 'res1',
          propertyId: 'prop1',
          startDate: '2024-03-15',
          endDate: '2024-03-20',
          numberOfGuests: 3,
          totalPrice: 500,
          userId: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);
      mockContext.prisma.reservation.findMany.mockResolvedValue(
        existingReservations,
      );

      // Act & Assert
      await expect(
        service.create({
          propertyId: 'prop1',
          userId: 'user1',
          startDate: '2024-03-17',
          endDate: '2024-03-19',
          numberOfGuests: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

### Key Testing Points

1. **Complex Business Logic**: Testing date overlaps and capacity constraints
2. **Database Mocking**: Using mock Prisma client
3. **Multiple Dependencies**: Mocking both database and property service
4. **Edge Cases**: Testing capacity limits and date overlaps

## 3. Complex Business Logic - Reservation Availability Checking

This example demonstrates testing complex business logic around checking property availability for reservations.

### Service Code

```typescript
// reservation.service.ts
private async checkPropertyAvailability(
  propertyId: string,
  startDate: string,
  endDate: string,
  requestedGuests: number,
  excludeReservationId?: string,
): Promise<DailyAvailability[]> {
  const property = await this.propertyService.findByIdWithFullDetails(propertyId);
  const propertyCapacity = property.guests;

  const overlappingReservations = await this.prisma.reservation.findMany({
    where: {
      propertyId,
      AND: [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
        ...(excludeReservationId ? [{ NOT: { id: excludeReservationId } }] : []),
      ],
    },
  });

  const dailyGuestCounts = new Map<string, number>();
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const daysInRange = end.diff(start, 'day') + 1;

  // Initialize all dates with the requested guest count
  for (let i = 0; i < daysInRange; i++) {
    const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
    dailyGuestCounts.set(currentDate, requestedGuests);
  }

  // Add guests from existing reservations
  overlappingReservations.forEach((reservation) => {
    const resStart = dayjs(reservation.startDate);
    const resEnd = dayjs(reservation.endDate);

    for (let i = 0; i < daysInRange; i++) {
      const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
      if (dayjs(currentDate).isBetween(resStart, resEnd, 'day', '[]')) {
        const existingCount = dailyGuestCounts.get(currentDate) || 0;
        dailyGuestCounts.set(
          currentDate,
          existingCount + reservation.numberOfGuests,
        );
      }
    }
  });

  const availability: DailyAvailability[] = [];
  let hasAvailabilityIssue = false;
  let errorMessage = '';

  dailyGuestCounts.forEach((totalGuests, date) => {
    const availableSlots = propertyCapacity - totalGuests;
    availability.push({ date, totalGuests, availableSlots });

    if (availableSlots < 0) {
      hasAvailabilityIssue = true;
      errorMessage += `\n- ${date}: Exceeds capacity by ${Math.abs(
        availableSlots,
      )} guests`;
    }
  });

  if (hasAvailabilityIssue) {
    throw new BadRequestException(
      `Property capacity exceeded on following dates:${errorMessage}\n` +
        `Property capacity: ${propertyCapacity} guests`,
    );
  }

  return availability;
}
```

### Test Code

```typescript
// reservation.service.spec.ts
describe('checkPropertyAvailability', () => {
  const mockProperty = {
    id: 'prop1',
    guests: 4,
    // ... other property fields
  };

  beforeEach(() => {
    propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);
  });

  it('should allow booking when property has capacity', async () => {
    // Arrange
    const startDate = '2024-03-15';
    const endDate = '2024-03-20';
    const requestedGuests = 2;

    mockContext.prisma.reservation.findMany.mockResolvedValue([
      {
        id: 'res1',
        startDate: '2024-03-17',
        endDate: '2024-03-19',
        numberOfGuests: 1,
      },
    ]);

    // Act
    const result = await service['checkPropertyAvailability'](
      'prop1',
      startDate,
      endDate,
      requestedGuests,
    );

    // Assert
    expect(result).toHaveLength(6); // 6 days of availability
    expect(result.find((day) => day.date === '2024-03-17')).toEqual({
      date: '2024-03-17',
      totalGuests: 3, // 2 requested + 1 existing
      availableSlots: 1, // 4 capacity - 3 total
    });
  });

  it('should throw error when capacity is exceeded', async () => {
    // Arrange
    const startDate = '2024-03-15';
    const endDate = '2024-03-20';
    const requestedGuests = 3;

    mockContext.prisma.reservation.findMany.mockResolvedValue([
      {
        id: 'res1',
        startDate: '2024-03-17',
        endDate: '2024-03-19',
        numberOfGuests: 2,
      },
    ]);

    // Act & Assert
    await expect(
      service['checkPropertyAvailability'](
        'prop1',
        startDate,
        endDate,
        requestedGuests,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should handle multiple overlapping reservations', async () => {
    // Arrange
    const startDate = '2024-03-15';
    const endDate = '2024-03-20';
    const requestedGuests = 1;

    mockContext.prisma.reservation.findMany.mockResolvedValue([
      {
        id: 'res1',
        startDate: '2024-03-16',
        endDate: '2024-03-18',
        numberOfGuests: 1,
      },
      {
        id: 'res2',
        startDate: '2024-03-17',
        endDate: '2024-03-19',
        numberOfGuests: 1,
      },
    ]);

    // Act
    const result = await service['checkPropertyAvailability'](
      'prop1',
      startDate,
      endDate,
      requestedGuests,
    );

    // Assert
    expect(result.find((day) => day.date === '2024-03-17')).toEqual({
      date: '2024-03-17',
      totalGuests: 3, // 1 requested + 2 existing
      availableSlots: 1, // 4 capacity - 3 total
    });
  });

  it('should exclude specified reservation when updating', async () => {
    // Arrange
    const startDate = '2024-03-15';
    const endDate = '2024-03-20';
    const requestedGuests = 2;
    const excludeReservationId = 'res1';

    mockContext.prisma.reservation.findMany.mockResolvedValue([
      {
        id: 'res2',
        startDate: '2024-03-17',
        endDate: '2024-03-19',
        numberOfGuests: 1,
      },
    ]);

    // Act
    const result = await service['checkPropertyAvailability'](
      'prop1',
      startDate,
      endDate,
      requestedGuests,
      excludeReservationId,
    );

    // Assert
    expect(result.find((day) => day.date === '2024-03-17')).toEqual({
      date: '2024-03-17',
      totalGuests: 3, // 2 requested + 1 from non-excluded reservation
      availableSlots: 1,
    });
  });
});
```

### Key Testing Points

1. **Complex Business Logic Testing**

   - Testing date-based calculations
   - Handling overlapping reservations
   - Capacity validation across multiple days

2. **Edge Cases**

   - Multiple overlapping reservations
   - Capacity exactly at limit
   - Excluding specific reservations for updates

3. **Error Handling**

   - Proper error types for different scenarios
   - Detailed error messages
   - Validation of business rules

4. **Date Manipulation**

   - Using dayjs for date calculations
   - Testing date ranges
   - Handling date boundaries

5. **Data Structure Testing**
   - Map usage for daily counts
   - Array transformations
   - Complex object validation

### Testing Patterns Demonstrated

1. **Setup and Teardown**

   - Proper mock initialization
   - Clean state between tests
   - Reusable mock data

2. **Mocking Strategies**

   - Service dependencies
   - Database queries
   - Date manipulation

3. **Assertion Patterns**

   - Complex object matching
   - Error validation
   - Array content verification

4. **Test Organization**
   - Logical test grouping
   - Clear test descriptions
   - Progressive complexity in test cases

## 3. Property Service - Search and Filtering

### Service Code

```typescript
// property.service.ts
@Injectable()
export class PropertyService {
  constructor(private readonly prisma: DatabaseService) {}

  async findManyPublic(filters: PropertyFilters, skip = 0, take = 10) {
    const where: Prisma.PropertyWhereInput = {};

    // Apply category filter
    if (filters.categoryName) {
      where.category = {
        name: filters.categoryName,
      };
    }

    // Apply name search
    if (filters.propertyName) {
      where.name = {
        contains: filters.propertyName,
        mode: 'insensitive',
      };
    }

    // Apply price range filter
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Apply guest count filter
    if (filters.guests) {
      where.guests = {
        gte: filters.guests,
      };
    }

    return this.prisma.property.findMany({
      where,
      include: {
        category: true,
        amenities: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
```

### Test Code

```typescript
// property.service.spec.ts
describe('PropertyService', () => {
  let service: PropertyService;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      PropertyService,
    ]);
    service = module.get<PropertyService>(PropertyService);
    mockContext = mc;
  });

  describe('findManyPublic', () => {
    it('should apply all filters correctly', async () => {
      // Arrange
      const filters = {
        categoryName: 'cabin',
        propertyName: 'lake',
        minPrice: 100,
        maxPrice: 500,
        guests: 4,
      };

      const mockProperties = [
        {
          id: 'prop1',
          name: 'Lake Cabin',
          price: 200,
          guests: 4,
          category: { name: 'cabin' },
          amenities: [],
          creator: { id: 'user1', username: 'owner' },
        },
      ];

      mockContext.prisma.property.findMany.mockResolvedValue(mockProperties);

      // Act
      const result = await service.findManyPublic(filters);

      // Assert
      expect(mockContext.prisma.property.findMany).toHaveBeenCalledWith({
        where: {
          category: { name: 'cabin' },
          name: { contains: 'lake', mode: 'insensitive' },
          price: { gte: 100, lte: 500 },
          guests: { gte: 4 },
        },
        include: {
          category: true,
          amenities: true,
          creator: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockProperties);
    });

    it('should handle empty filters', async () => {
      // Arrange
      const mockProperties = [
        /* mock properties */
      ];
      mockContext.prisma.property.findMany.mockResolvedValue(mockProperties);

      // Act
      const result = await service.findManyPublic({});

      // Assert
      expect(mockContext.prisma.property.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
```

### Key Testing Points

1. **Complex Query Building**: Testing dynamic filter construction
2. **Multiple Filter Combinations**: Testing with various filter combinations
3. **Default Values**: Testing behavior with no filters
4. **Query Structure**: Verifying correct Prisma query construction

## Best Practices Demonstrated

1. **Test Organization**

   - Clear test suite structure
   - Descriptive test names
   - Logical grouping of related tests

2. **Mock Management**

   - Proper dependency mocking
   - Clean mock setup and reset
   - Type-safe mocking with TypeScript

3. **Test Coverage**

   - Happy path testing
   - Error case testing
   - Edge case testing
   - Business rule validation

4. **Code Quality**
   - DRY test code
   - Clear arrange-act-assert pattern
   - Meaningful assertions

## Common Testing Patterns

1. **Setup Pattern**

```typescript
beforeEach(async () => {
  // Setup mocks and service
});

afterEach(() => {
  // Clean up
  jest.clearAllMocks();
});
```

2. **Error Testing Pattern**

```typescript
it('should handle errors', async () => {
  // Arrange
  mockDependency.method.mockRejectedValue(new Error());

  // Act & Assert
  await expect(service.method()).rejects.toThrow();
});
```

3. **Data Factory Pattern**

```typescript
const createMockProperty = (override = {}) => ({
  id: 'prop1',
  name: 'Test Property',
  ...override,
});
```

## Next Steps

1. Review the actual test files in the codebase:

   - [Auth Service Tests](../apps/main-service/src/domain/auth/auth.service.spec.ts)
   - [Property Service Tests](../apps/main-service/src/domain/property/property.service.spec.ts)
   - [Reservation Service Tests](../apps/main-service/src/domain/reservation/reservation.service.spec.ts)

2. Practice writing tests:

   - Start with simple services
   - Progress to complex business logic
   - Add edge case tests

3. Improve test coverage:
   - Run coverage reports
   - Identify gaps in testing
   - Add missing test cases

## 4. Guard Testing - Authorization Logic

### Service Code

```typescript
// reservation.guard.ts
@Injectable()
export class ReservationGuard implements CanActivate {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly reservationService: ReservationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    const user = request.user;
    const propertyId = request.query.propertyId;
    const reservationId = request.params.reservationId;
    const method = request.method;

    // Allow /reservations/my endpoint - it only needs auth
    if (path === '/v1/reservations/my') {
      return true;
    }

    // Case 1: Getting reservations for a property (for property owners)
    if (propertyId) {
      const property = await this.propertyService.findByIdWithFullDetails(
        propertyId,
      );
      if (property.creatorId !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to view reservations for this property',
        );
      }
      return true;
    }

    // Case 2: Accessing a specific reservation
    if (reservationId) {
      const reservation = await this.reservationService.findById(reservationId);

      // For updates and deletes, allow both reservation creator and property owner
      if (
        ['DELETE', 'PATCH'].includes(method) &&
        reservation.userId !== user.id &&
        reservation.property.creator.id !== user.id
      ) {
        throw new ForbiddenException(
          `You are not authorized to ${
            method === 'DELETE' ? 'delete' : 'update'
          } this reservation`,
        );
      }

      return true;
    }

    return false;
  }
}
```

### Test Code

```typescript
// reservation.guard.spec.ts
describe('ReservationGuard', () => {
  let guard: ReservationGuard;
  let propertyService: jest.Mocked<PropertyService>;
  let reservationService: jest.Mocked<ReservationService>;
  let mockContext: ExecutionContext;

  beforeEach(async () => {
    propertyService = {
      findByIdWithFullDetails: jest.fn(),
    } as any;

    reservationService = {
      findById: jest.fn(),
    } as any;

    const { module } = await createTestingModule([
      ReservationGuard,
      {
        provide: PropertyService,
        useValue: propertyService,
      },
      {
        provide: ReservationService,
        useValue: reservationService,
      },
    ]);

    guard = module.get<ReservationGuard>(ReservationGuard);
  });

  describe('property owner access', () => {
    it('should allow property owner to view reservations', async () => {
      // Arrange
      const mockUser = { id: 'owner1' };
      const mockProperty = { creatorId: 'owner1' };
      const mockRequest = {
        user: mockUser,
        query: { propertyId: 'prop1' },
        route: { path: '/v1/reservations' },
        method: 'GET',
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access to non-owner', async () => {
      // Arrange
      const mockUser = { id: 'user1' };
      const mockProperty = { creatorId: 'owner1' };
      const mockRequest = {
        user: mockUser,
        query: { propertyId: 'prop1' },
        route: { path: '/v1/reservations' },
        method: 'GET',
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      propertyService.findByIdWithFullDetails.mockResolvedValue(mockProperty);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reservation access', () => {
    it('should allow reservation creator to update', async () => {
      // Arrange
      const mockUser = { id: 'user1' };
      const mockReservation = {
        userId: 'user1',
        property: { creator: { id: 'owner1' } },
      };
      const mockRequest = {
        user: mockUser,
        params: { reservationId: 'res1' },
        route: { path: '/v1/reservations/:reservationId' },
        method: 'PATCH',
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      reservationService.findById.mockResolvedValue(mockReservation);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny update to unauthorized user', async () => {
      // Arrange
      const mockUser = { id: 'user2' };
      const mockReservation = {
        userId: 'user1',
        property: { creator: { id: 'owner1' } },
      };
      const mockRequest = {
        user: mockUser,
        params: { reservationId: 'res1' },
        route: { path: '/v1/reservations/:reservationId' },
        method: 'PATCH',
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      reservationService.findById.mockResolvedValue(mockReservation);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
```

### Key Testing Points

1. **Authorization Logic**

   - Test different user roles
   - Verify access control rules
   - Handle different HTTP methods

2. **Context Handling**

   - Mock ExecutionContext
   - Test different request paths
   - Handle query parameters and route params

3. **Error Cases**

   - Test unauthorized access
   - Verify error messages
   - Handle missing data

4. **Integration with Services**
   - Mock service dependencies
   - Test service interactions
   - Handle async operations

### Testing Patterns Demonstrated

1. **Guard Testing**

   - Mock HTTP context
   - Test authorization rules
   - Handle different request scenarios

2. **Context Mocking**

   - Create mock requests
   - Simulate different user roles
   - Test path parameters

3. **Error Handling**

   - Test authorization failures
   - Verify error types
   - Check error messages

4. **Test Organization**
   - Group tests by scenario
   - Clear test descriptions
   - Comprehensive coverage
