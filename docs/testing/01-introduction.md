# Introduction to Unit Testing

## What is Unit Testing?

Unit testing is a software testing method where individual units or components of software are tested in isolation. A unit is the smallest testable part of any software, typically a function, method, or class. The main goal is to validate that each unit of the software performs as designed.

## Why Do We Need Unit Tests?

1. **Early Bug Detection**

   - Catch bugs early in the development cycle
   - Reduce the cost of fixing bugs
   - Prevent bugs from reaching production

2. **Code Quality**

   - Enforce better code organization
   - Encourage modular design
   - Improve code maintainability

3. **Documentation**

   - Tests serve as documentation
   - Show how code should behave
   - Provide examples of code usage

4. **Confidence in Changes**

   - Safely refactor code
   - Add new features without breaking existing ones
   - Identify unintended side effects

5. **Development Speed**
   - Faster debugging
   - Quicker feature implementation
   - Reduced manual testing time

## Fundamental Testing Concepts

### 1. Test Structure

Every test follows a basic structure:

```typescript
describe('Calculator', () => {
  // Test Suite
  describe('add method', () => {
    // Test Group
    it('should add two numbers', () => {
      // Individual Test
      // Test implementation
    });
  });
});
```

- **Test Suite**: Groups related tests (`describe` block)
- **Test Group**: Organizes tests for specific functionality
- **Individual Test**: Tests a specific behavior (`it` or `test` block)

### 2. Test Lifecycle Hooks

Jest provides several hooks to run code at specific times:

```typescript
describe('UserService', () => {
  let service: UserService;
  let database: Database;

  // Runs once before all tests in this describe block
  beforeAll(() => {
    database = new Database();
  });

  // Runs before each test
  beforeEach(() => {
    service = new UserService(database);
  });

  // Runs after each test
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock data
  });

  // Runs once after all tests in this describe block
  afterAll(() => {
    database.disconnect();
  });

  it('should create user', () => {
    // Test implementation
  });
});
```

#### When to Use Each Hook:

- **beforeAll**: Setup that's needed once for all tests (database connections, etc.)
- **beforeEach**: Reset state before each test (new service instance, clear mocks)
- **afterEach**: Clean up after each test (clear mocks, reset state)
- **afterAll**: Clean up after all tests (close connections, etc.)

### 3. Arrange-Act-Assert Pattern

Every test should follow this pattern:

```typescript
it('should calculate total price', () => {
  // Arrange: Set up test data
  const calculator = new PriceCalculator();
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 },
  ];

  // Act: Execute the code being tested
  const total = calculator.calculateTotal(items);

  // Assert: Verify the result
  expect(total).toBe(35);
});
```

### 4. Assertions

Jest provides various ways to verify results:

```typescript
describe('Assertions Examples', () => {
  it('demonstrates common assertions', () => {
    // Equality
    expect(2 + 2).toBe(4);
    expect(obj).toEqual({ name: 'test' });

    // Truthiness
    expect(value).toBeTruthy();
    expect(value).toBeFalsy();
    expect(value).toBeNull();
    expect(value).toBeUndefined();

    // Numbers
    expect(number).toBeGreaterThan(3);
    expect(number).toBeLessThan(5);

    // Strings
    expect(text).toMatch(/pattern/);
    expect(text).toContain('substring');

    // Arrays
    expect(array).toContain(item);
    expect(array).toHaveLength(3);

    // Objects
    expect(object).toHaveProperty('name');
    expect(object).toMatchObject({ id: 1 });
  });
});
```

### 5. Mocking

Mocking is used to isolate the code being tested:

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    // Create a mock
    mockDatabase = {
      query: jest.fn(),
      connect: jest.fn(),
    };

    // Inject the mock
    service = new UserService(mockDatabase);
  });

  it('should find user by id', async () => {
    // Setup mock behavior
    mockDatabase.query.mockResolvedValue([{ id: 1, name: 'Test' }]);

    // Use the service
    const user = await service.findById(1);

    // Verify mock was called correctly
    expect(mockDatabase.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = ?',
      [1],
    );

    // Verify result
    expect(user).toEqual({ id: 1, name: 'Test' });
  });
});
```

### 6. Async Testing

Testing asynchronous code requires special handling:

```typescript
describe('AsyncService', () => {
  it('should handle promises', async () => {
    // Using async/await
    const result = await service.doAsync();
    expect(result).toBe('done');
  });

  it('should handle rejections', async () => {
    // Testing errors
    await expect(service.doAsync()).rejects.toThrow('error');
  });

  it('should use done callback', (done) => {
    // Using callbacks
    service.doAsync().then((result) => {
      expect(result).toBe('done');
      done();
    });
  });
});
```

## Advanced Testing Concepts

### 1. Test Doubles

Test doubles are objects that stand in for real dependencies. There are several types:

```typescript
describe('Test Doubles Examples', () => {
  // 1. Dummy - Objects passed around but never used
  const dummyLogger = { log: () => {} };

  // 2. Stub - Provides predefined answers to calls
  const stubDatabase = {
    query: () => Promise.resolve([{ id: 1 }]),
  };

  // 3. Spy - Records information about calls
  const spyFunction = jest.fn();
  spyFunction('test');
  expect(spyFunction).toHaveBeenCalledWith('test');

  // 4. Mock - Pre-programmed with expectations
  const mockUserService = {
    findUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  };

  // 5. Fake - Working implementation but not suitable for production
  const fakeAuthService = {
    tokens: new Map(),
    createToken: (userId: string) => {
      const token = Math.random().toString();
      this.tokens.set(token, userId);
      return token;
    },
    verifyToken: (token: string) => this.tokens.get(token),
  };
});
```

### 2. Test-Driven Development (TDD)

TDD follows a red-green-refactor cycle:

```typescript
// 1. Red: Write a failing test
describe('UserService', () => {
  it('should create user with valid data', () => {
    const service = new UserService();
    const userData = { name: 'Test', email: 'test@example.com' };

    const user = service.createUser(userData);

    expect(user).toMatchObject(userData);
  });
});

// 2. Green: Write minimal code to make test pass
class UserService {
  createUser(data: any) {
    return { ...data };
  }
}

// 3. Refactor: Improve code while keeping tests green
class UserService {
  async createUser(data: UserData): Promise<User> {
    await this.validateUser(data);
    return this.userRepository.create(data);
  }
}
```

### 3. Parameterized Tests

Testing multiple scenarios efficiently:

```typescript
describe('Validation Tests', () => {
  // Using test.each for multiple test cases
  test.each([
    ['valid@email.com', true],
    ['invalid-email', false],
    ['', false],
    ['test@.com', false],
  ])('validates email %s to be %s', (email, expected) => {
    const validator = new EmailValidator();
    expect(validator.isValid(email)).toBe(expected);
  });

  // Using describe.each for related test cases
  describe.each([
    { age: -1, expected: false },
    { age: 0, expected: true },
    { age: 120, expected: true },
    { age: 121, expected: false },
  ])('age validation for $age', ({ age, expected }) => {
    it(`should return ${expected}`, () => {
      const validator = new AgeValidator();
      expect(validator.isValid(age)).toBe(expected);
    });
  });
});
```

### 4. Test Coverage

Understanding and measuring test coverage:

```typescript
// Example of different coverage types
class UserManager {
  constructor(private userService: UserService) {}

  // Line Coverage: Execute each line
  async createUser(data: UserData) {
    const user = await this.userService.create(data);
    return user;
  }

  // Branch Coverage: Test all decision paths
  validateAge(age: number) {
    if (age < 0) {
      throw new Error('Age cannot be negative');
    }
    if (age > 120) {
      throw new Error('Age cannot be over 120');
    }
    return true;
  }

  // Function Coverage: Call all functions
  async deleteUser(id: string) {
    return this.userService.delete(id);
  }

  // Statement Coverage: Execute all statements
  updateUser(id: string, data: Partial<UserData>) {
    const user = this.userService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.userService.update(id, data);
  }
}
```

### 5. Testing Complex Scenarios

#### Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle network errors', async () => {
    // Arrange
    const error = new Error('Network error');
    mockApi.get.mockRejectedValue(error);

    // Act & Assert
    await expect(service.fetchData()).rejects.toThrow('Network error');
    expect(errorLogger.log).toHaveBeenCalledWith(error);
  });

  it('should retry failed requests', async () => {
    // Arrange
    mockApi.get
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce({ data: 'success' });

    // Act
    const result = await service.fetchWithRetry();

    // Assert
    expect(result).toEqual({ data: 'success' });
    expect(mockApi.get).toHaveBeenCalledTimes(3);
  });
});
```

#### Race Conditions

```typescript
describe('Race Condition Tests', () => {
  it('should handle concurrent operations', async () => {
    // Arrange
    const operations = [
      service.updateCounter(1),
      service.updateCounter(1),
      service.updateCounter(1),
    ];

    // Act
    await Promise.all(operations);

    // Assert
    expect(await service.getCounter()).toBe(3);
  });
});
```

### 6. Testing Patterns

#### Builder Pattern for Test Data

```typescript
class UserBuilder {
  private user: Partial<User> = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  };

  withId(id: string) {
    this.user.id = id;
    return this;
  }

  withName(name: string) {
    this.user.name = name;
    return this;
  }

  withEmail(email: string) {
    this.user.email = email;
    return this;
  }

  build(): User {
    return this.user as User;
  }
}

describe('User Tests', () => {
  it('should create user with custom data', () => {
    const user = new UserBuilder()
      .withName('Custom Name')
      .withEmail('custom@test.com')
      .build();

    expect(service.validateUser(user)).toBe(true);
  });
});
```

#### Factory Pattern for Mocks

```typescript
class MockFactory {
  static createMockUserService(): jest.Mocked<UserService> {
    return {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
  }

  static createMockAuthService(): jest.Mocked<AuthService> {
    return {
      validateToken: jest.fn(),
      createToken: jest.fn(),
      revokeToken: jest.fn(),
    } as any;
  }
}

describe('Service Tests', () => {
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    userService = MockFactory.createMockUserService();
    authService = MockFactory.createMockAuthService();
  });
});
```

### 7. Testing Anti-patterns to Avoid

```typescript
describe('Anti-patterns', () => {
  // ❌ Don't test implementation details
  it('bad: testing private methods directly', () => {
    expect(service['privateMethod']()).toBe(true);
  });

  // ❌ Don't use sleep in tests
  it('bad: using setTimeout', async () => {
    service.startProcess();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(service.isComplete()).toBe(true);
  });

  // ✅ Instead, mock time or use events
  it('good: using fake timers', () => {
    jest.useFakeTimers();
    service.startProcess();
    jest.runAllTimers();
    expect(service.isComplete()).toBe(true);
  });

  // ❌ Don't share state between tests
  let sharedData: any;
  it('bad: using shared state', () => {
    sharedData = service.process();
    expect(sharedData).toBeDefined();
  });

  // ✅ Instead, setup state in each test
  it('good: independent test', () => {
    const data = service.process();
    expect(data).toBeDefined();
  });
});
```

## Testing Best Practices

1. **Test Independence**

   - Each test should run independently
   - Tests should not share state
   - Use beforeEach to reset state

2. **Clear Test Names**

   ```typescript
   // Good
   it('should throw error when user not found', () => {});

   // Bad
   it('test user error', () => {});
   ```

3. **Single Assertion Concept**

   ```typescript
   // Good
   it('should update user name', () => {
     const result = service.updateName(1, 'New Name');
     expect(result.name).toBe('New Name');
   });

   // Bad (testing multiple things)
   it('should update user', () => {
     const result = service.updateUser(1, data);
     expect(result.name).toBe('New Name');
     expect(result.email).toBe('new@email.com');
     expect(result.age).toBe(25);
   });
   ```

4. **Meaningful Assertions**

   ```typescript
   // Good
   expect(user.isAdmin).toBe(true);

   // Bad
   expect(user.isAdmin).toBeTruthy();
   ```

## Types of Tests

1. **Unit Tests**

   - Test individual components
   - Mock dependencies
   - Fast execution

2. **Integration Tests**

   - Test component interactions
   - May use real dependencies
   - Medium execution speed

3. **End-to-End Tests**
   - Test complete workflows
   - Use real environment
   - Slower execution

## Next Steps

Now that you understand both basic and advanced testing concepts, continue to:

1. [Jest Configuration and Setup](02-jest-setup.md)
2. [Mocking with Jest](03-mocking.md)
3. [Test Structure and Best Practices](04-test-structure.md)
4. [Real-world Examples](05-real-world-examples.md)
