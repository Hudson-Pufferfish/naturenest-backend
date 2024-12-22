# Mocking with Jest

## Introduction to Mocking

Mocking is a crucial concept in unit testing where we replace real dependencies with simulated ones. This allows us to:

- Test components in isolation
- Control dependency behavior
- Test edge cases and error scenarios
- Speed up tests by avoiding external services

## Types of Mocks in Jest

### 1. Jest Mock Functions

Basic mock functions (spies):

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
// or
mockFn.mockImplementation(() => 42);
```

### 2. Module Mocks

Mocking entire modules:

```typescript
jest.mock('./database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
```

### 3. Class Mocks

Mocking classes:

```typescript
jest.mock('./UserService', () => {
  return jest.fn().mockImplementation(() => ({
    findUser: jest.fn(),
    createUser: jest.fn(),
  }));
});
```

## Real Examples from Our Codebase

### 1. Database Mocking

From our `database.service.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};
```

Usage in tests:

```typescript
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

  it('should find user by email', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      // ... other user properties
    };

    mockContext.prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.findOneByEmail('test@example.com');
    expect(result).toEqual(mockUser);
  });
});
```

### 2. Service Dependencies

From our `auth.service.spec.ts`:

```typescript
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
});
```

## Mock Implementation Techniques

### 1. Return Values

```typescript
// Simple return value
mockFn.mockReturnValue(42);

// Return different values on subsequent calls
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(3);

// Return Promise
mockFn.mockResolvedValue({ data: 'success' });
mockFn.mockRejectedValue(new Error('failure'));
```

### 2. Custom Implementation

```typescript
mockFn.mockImplementation((arg1, arg2) => {
  if (arg1 === 'special') {
    return 'special case';
  }
  return 'default case';
});
```

### 3. Spying on Method Calls

```typescript
// Check if mock was called
expect(mockFn).toHaveBeenCalled();

// Check number of calls
expect(mockFn).toHaveBeenCalledTimes(2);

// Check call arguments
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Check all calls
expect(mockFn.mock.calls).toEqual([
  ['arg1', 'arg2'],
  ['arg3', 'arg4'],
]);
```

## Advanced Mocking Techniques

### 1. Partial Mocks

```typescript
// Mock only specific methods
jest.spyOn(service, 'methodName').mockImplementation(() => 'mocked');

// Restore original implementation
jest.spyOn(service, 'methodName').mockRestore();
```

### 2. Timer Mocks

```typescript
// Mock timers
jest.useFakeTimers();

test('delayed execution', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  // Fast-forward time
  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();
});

// Restore real timers
jest.useRealTimers();
```

### 3. Module Factory Mocks

```typescript
jest.mock('./config', () => {
  const originalModule = jest.requireActual('./config');
  return {
    ...originalModule,
    someConfig: 'mocked value',
  };
});
```

## Best Practices

1. **Mock at the Right Level**

   - Mock external dependencies
   - Don't mock the system under test
   - Mock at the same level as the test

2. **Keep Mocks Simple**

   - Only mock what you need
   - Avoid complex mock implementations
   - Use the simplest mock that works

3. **Verify Mock Usage**

   - Check if mocks were called
   - Verify call arguments
   - Clear mocks between tests

4. **Reset Mocks**

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear mock usage data
  // or
  jest.resetAllMocks(); // Clear mock usage and implementation
  // or
  jest.restoreAllMocks(); // Restore original implementation
});
```

## Common Pitfalls

1. **Over-mocking**

   - Mocking too many things
   - Making tests brittle
   - Solution: Only mock external dependencies

2. **Under-verifying**

   - Not checking mock calls
   - Missing important assertions
   - Solution: Verify all important mock interactions

3. **Mock Implementation Leaks**
   - Mocks affecting other tests
   - Solution: Clear or reset mocks between tests

## Next Steps

1. Learn about [Test Structure and Best Practices](04-test-structure.md)
2. Study [Real-world Examples](05-real-world-examples.md)
