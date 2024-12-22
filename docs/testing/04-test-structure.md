# Test Structure and Best Practices

## Test File Organization

### 1. File Naming Convention

In our NatureNest backend, we follow these conventions:

```
src/
  domain/
    user/
      user.service.ts         # Source file
      user.service.spec.ts    # Test file
    auth/
      auth.service.ts
      auth.service.spec.ts
```

### 2. Test Suite Structure

Basic structure of a test file:

```typescript
describe('ServiceName', () => {
  // Setup
  let service: ServiceName;
  let dependencies: Dependencies;

  // Before hooks
  beforeEach(() => {
    // Setup for each test
  });

  // Test groups
  describe('methodName', () => {
    // Individual tests
    it('should do something specific', () => {
      // Test code
    });
  });
});
```

## Real Example from Our Codebase

From `property.service.spec.ts`:

```typescript
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

  describe('create', () => {
    it('should create a property with valid data', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat1',
        name: 'cabin',
        description: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProperty = {
        id: 'prop1',
        name: 'Test Property',
        // ... other properties
      };

      mockContext.prisma.category.findUnique.mockResolvedValue(mockCategory);
      mockContext.prisma.property.create.mockResolvedValue(mockProperty);

      // Act
      const result = await service.create({
        name: 'Test Property',
        // ... other properties
      });

      // Assert
      expect(result).toEqual(mockProperty);
    });

    it('should throw BadRequestException if category not found', async () => {
      // Arrange
      mockContext.prisma.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create({
          name: 'Test Property',
          // ... other properties
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

## Best Practices

### 1. Test Naming

Follow a clear naming convention:

```typescript
// Pattern: should + expected behavior + when/if + condition
it('should return user when valid ID is provided', () => {});
it('should throw error if user not found', () => {});
it('should update user profile successfully', () => {});
```

### 2. Arrange-Act-Assert Pattern

Structure each test in three parts:

```typescript
it('should calculate total price correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 },
  ];
  const calculator = new PriceCalculator();

  // Act
  const total = calculator.calculateTotal(items);

  // Assert
  expect(total).toBe(35);
});
```

### 3. Test Independence

Each test should:

- Be independent of other tests
- Clean up after itself
- Not rely on test order

```typescript
describe('UserService', () => {
  beforeEach(() => {
    // Reset state before each test
    jest.clearAllMocks();
    // Reset database if needed
  });

  it('test 1', () => {
    // This test is independent
  });

  it('test 2', () => {
    // This test is also independent
  });
});
```

### 4. Testing Edge Cases

Always test edge cases:

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(calculator.divide(10, 2)).toBe(5);
  });

  it('should throw error when dividing by zero', () => {
    expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle decimal numbers', () => {
    expect(calculator.divide(10, 3)).toBeCloseTo(3.333, 3);
  });
});
```

### 5. Async Testing

Proper async test handling:

```typescript
describe('UserService', () => {
  it('should fetch user asynchronously', async () => {
    // Using async/await
    const user = await service.findUser(1);
    expect(user).toBeDefined();
  });

  it('should handle async errors', async () => {
    // Testing async errors
    await expect(service.findUser(-1)).rejects.toThrow();
  });
});
```

### 6. Mock Data Organization

Keep mock data organized:

```typescript
// mock-data/users.ts
export const mockUsers = {
  valid: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  },
  invalid: {
    id: -1,
    name: '',
    email: 'invalid-email',
  },
};

// In tests
import { mockUsers } from './mock-data/users';

it('should validate user', () => {
  expect(validateUser(mockUsers.valid)).toBe(true);
  expect(validateUser(mockUsers.invalid)).toBe(false);
});
```

### 7. Error Testing

Properly test error conditions:

```typescript
describe('error handling', () => {
  it('should throw specific error types', () => {
    expect(() => service.validateInput('')).toThrow(ValidationError);
    expect(() => service.validateInput('')).toThrow('Input cannot be empty');
  });

  it('should handle async errors', async () => {
    await expect(service.findUser(-1)).rejects.toThrow(NotFoundError);
  });
});
```

### 8. Parameterized Tests

Use test.each for multiple test cases:

```typescript
describe('validation', () => {
  test.each([
    ['valid@email.com', true],
    ['invalid-email', false],
    ['', false],
  ])('validates email %s to be %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

## Common Patterns

### 1. Factory Pattern

Create test data factories:

```typescript
const createTestUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

it('should update user', () => {
  const user = createTestUser({ name: 'Custom Name' });
  expect(user.name).toBe('Custom Name');
});
```

### 2. Builder Pattern

For complex test objects:

```typescript
class TestUserBuilder {
  private user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  };

  withName(name: string) {
    this.user.name = name;
    return this;
  }

  withEmail(email: string) {
    this.user.email = email;
    return this;
  }

  build() {
    return { ...this.user };
  }
}

it('should create custom user', () => {
  const user = new TestUserBuilder()
    .withName('Custom')
    .withEmail('custom@test.com')
    .build();
});
```

## Test Coverage

### 1. Coverage Goals

Aim for high coverage but focus on quality:

- Statements: > 80%
- Branches: > 80%
- Functions: > 90%
- Lines: > 80%

### 2. Running Coverage

```bash
# Run coverage
yarn test:cov

# Generate HTML report
yarn test:cov --coverage-reporter=html
```

### 3. Coverage Report Analysis

```bash
# Example coverage report
-----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files       |   85.71 |    83.33 |   85.71 |   85.71 |
 calculator.ts  |   85.71 |    83.33 |   85.71 |   85.71 | 15-16
-----------------|---------|----------|---------|---------|-------------------
```

## Next Steps

1. Study [Real-world Examples](05-real-world-examples.md)
2. Practice writing tests for new features
3. Review and improve existing tests
