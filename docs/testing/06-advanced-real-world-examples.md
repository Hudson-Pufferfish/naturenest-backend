# Advanced Real-world Testing Examples

This document provides advanced testing examples from various modern architectures and complex scenarios. These examples are drawn from real-world applications using GraphQL, gRPC, microservices, and other sophisticated patterns.

## 1. GraphQL API Testing

### Service Implementation

```typescript
// user.resolver.ts
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => UserConnection)
  async users(
    @Args() args: ConnectionArgs,
    @Context() context: GraphQLContext,
  ): Promise<UserConnection> {
    await this.authService.validateToken(context.token);
    return this.userService.findConnection(args);
  }

  @Mutation(() => User)
  async updateUserProfile(
    @Args('input') input: UpdateUserProfileInput,
    @Context() context: GraphQLContext,
  ): Promise<User> {
    const userId = await this.authService.validateToken(context.token);
    return this.userService.updateProfile(userId, input);
  }

  @ResolveField(() => [Order])
  async orders(
    @Parent() user: User,
    @Args() args: OrderFilterInput,
  ): Promise<Order[]> {
    return this.userService.findUserOrders(user.id, args);
  }
}
```

### Test Implementation

```typescript
// user.resolver.spec.ts
describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
    authService = module.get(AuthService);
  });

  describe('users query', () => {
    it('should return paginated users', async () => {
      // Arrange
      const args: ConnectionArgs = {
        first: 10,
        after: 'cursor',
      };
      const context: GraphQLContext = {
        token: 'valid.jwt.token',
      };
      const mockConnection: UserConnection = {
        edges: [
          {
            node: { id: '1', name: 'Test User' },
            cursor: 'user1',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'user1',
        },
      };

      authService.validateToken.mockResolvedValue('user-id');
      userService.findConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await resolver.users(args, context);

      // Assert
      expect(result).toEqual(mockConnection);
      expect(authService.validateToken).toHaveBeenCalledWith('valid.jwt.token');
      expect(userService.findConnection).toHaveBeenCalledWith(args);
    });

    it('should throw when token is invalid', async () => {
      // Arrange
      const args: ConnectionArgs = { first: 10 };
      const context: GraphQLContext = { token: 'invalid.token' };

      authService.validateToken.mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      // Act & Assert
      await expect(resolver.users(args, context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('orders field resolver', () => {
    it('should resolve user orders with filters', async () => {
      // Arrange
      const user: User = { id: '1', name: 'Test User' };
      const args: OrderFilterInput = {
        status: OrderStatus.COMPLETED,
        fromDate: '2024-01-01',
      };
      const mockOrders: Order[] = [
        { id: '1', userId: '1', status: OrderStatus.COMPLETED },
      ];

      userService.findUserOrders.mockResolvedValue(mockOrders);

      // Act
      const result = await resolver.orders(user, args);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(userService.findUserOrders).toHaveBeenCalledWith(user.id, args);
    });
  });
});
```

### Key Testing Points

1. **GraphQL-specific Testing**

   - Testing resolvers
   - Handling GraphQL context
   - Testing field resolvers
   - Pagination testing

2. **Authentication Integration**
   - Token validation
   - Context handling
   - Error scenarios

## 2. gRPC Service Testing

### Service Implementation

```typescript
// order.service.ts
@Injectable()
export class OrderService {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: PaymentServiceClient,
    @Inject('INVENTORY_SERVICE')
    private inventoryClient: InventoryServiceClient,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Start transaction
    const orderTransaction = await this.orderRepository.startTransaction();

    try {
      // Check inventory
      const inventoryCheck = await this.inventoryClient
        .checkAvailability({
          items: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        })
        .toPromise();

      if (!inventoryCheck.available) {
        throw new Error('Insufficient inventory');
      }

      // Create payment
      const payment = await this.paymentClient
        .processPayment({
          amount: input.totalAmount,
          currency: input.currency,
          paymentMethodId: input.paymentMethodId,
        })
        .toPromise();

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new Error('Payment failed');
      }

      // Create order
      const order = await this.orderRepository.create({
        ...input,
        paymentId: payment.id,
        status: OrderStatus.CONFIRMED,
      });

      // Reserve inventory
      await this.inventoryClient
        .reserveItems({
          orderId: order.id,
          items: input.items,
        })
        .toPromise();

      await orderTransaction.commit();
      return order;
    } catch (error) {
      await orderTransaction.rollback();
      throw error;
    }
  }
}
```

### Test Implementation

```typescript
// order.service.spec.ts
describe('OrderService', () => {
  let service: OrderService;
  let paymentClient: jest.Mocked<PaymentServiceClient>;
  let inventoryClient: jest.Mocked<InventoryServiceClient>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let orderTransaction: jest.Mocked<Transaction>;

  beforeEach(async () => {
    // Create mock clients
    paymentClient = {
      processPayment: jest.fn(),
    } as any;

    inventoryClient = {
      checkAvailability: jest.fn(),
      reserveItems: jest.fn(),
    } as any;

    orderTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    } as any;

    orderRepository = {
      startTransaction: jest.fn().mockResolvedValue(orderTransaction),
      create: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'PAYMENT_SERVICE',
          useValue: paymentClient,
        },
        {
          provide: 'INVENTORY_SERVICE',
          useValue: inventoryClient,
        },
        {
          provide: OrderRepository,
          useValue: orderRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('createOrder', () => {
    const mockOrderInput: CreateOrderInput = {
      userId: 'user1',
      items: [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod2', quantity: 1 },
      ],
      totalAmount: 100,
      currency: 'USD',
      paymentMethodId: 'pm1',
    };

    it('should create order successfully', async () => {
      // Arrange
      const mockInventoryCheck = { available: true };
      const mockPayment = { id: 'pay1', status: PaymentStatus.SUCCEEDED };
      const mockOrder = { id: 'order1', ...mockOrderInput };

      inventoryClient.checkAvailability.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(mockInventoryCheck),
      } as any);

      paymentClient.processPayment.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(mockPayment),
      } as any);

      inventoryClient.reserveItems.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({}),
      } as any);

      orderRepository.create.mockResolvedValue(mockOrder);

      // Act
      const result = await service.createOrder(mockOrderInput);

      // Assert
      expect(result).toEqual(mockOrder);
      expect(orderTransaction.commit).toHaveBeenCalled();
      expect(orderTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should rollback transaction when inventory check fails', async () => {
      // Arrange
      const mockInventoryCheck = { available: false };

      inventoryClient.checkAvailability.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(mockInventoryCheck),
      } as any);

      // Act & Assert
      await expect(service.createOrder(mockOrderInput)).rejects.toThrow(
        'Insufficient inventory',
      );
      expect(orderTransaction.rollback).toHaveBeenCalled();
      expect(orderTransaction.commit).not.toHaveBeenCalled();
    });

    it('should handle gRPC service errors', async () => {
      // Arrange
      const grpcError = {
        code: Status.UNAVAILABLE,
        details: 'Service unavailable',
      };

      inventoryClient.checkAvailability.mockReturnValue({
        toPromise: jest.fn().mockRejectedValue(grpcError),
      } as any);

      // Act & Assert
      await expect(service.createOrder(mockOrderInput)).rejects.toThrow();
      expect(orderTransaction.rollback).toHaveBeenCalled();
    });

    it('should retry failed gRPC calls', async () => {
      // Arrange
      const mockInventoryCheck = { available: true };
      const mockPayment = { id: 'pay1', status: PaymentStatus.SUCCEEDED };
      const mockOrder = { id: 'order1', ...mockOrderInput };

      // Simulate network failure then success
      inventoryClient.checkAvailability
        .mockReturnValueOnce({
          toPromise: jest.fn().mockRejectedValue({
            code: Status.UNAVAILABLE,
          }),
        } as any)
        .mockReturnValue({
          toPromise: jest.fn().mockResolvedValue(mockInventoryCheck),
        } as any);

      paymentClient.processPayment.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(mockPayment),
      } as any);

      inventoryClient.reserveItems.mockReturnValue({
        toPromise: jest.fn().mockResolvedValue({}),
      } as any);

      orderRepository.create.mockResolvedValue(mockOrder);

      // Act
      const result = await service.createOrder(mockOrderInput);

      // Assert
      expect(result).toEqual(mockOrder);
      expect(inventoryClient.checkAvailability).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Key Testing Points

1. **gRPC-specific Testing**

   - Mock gRPC clients
   - Handle streaming responses
   - Test service errors
   - Retry mechanisms

2. **Transaction Management**
   - Test commit/rollback scenarios
   - Error handling
   - Distributed transactions

## 3. Microservices Event Testing

### Service Implementation

```typescript
// order-processor.service.ts
@Injectable()
export class OrderProcessorService {
  constructor(
    @Inject('EVENT_BUS') private eventBus: EventBus,
    @Inject('KAFKA_PRODUCER') private kafkaProducer: Producer,
    private readonly orderRepository: OrderRepository,
    private readonly eventStore: EventStore,
  ) {}

  @Subscribe('OrderCreated')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const { orderId, items } = event;

    try {
      // Start processing
      await this.eventStore.saveEvent({
        type: 'OrderProcessingStarted',
        orderId,
        timestamp: new Date(),
      });

      // Process each item
      for (const item of items) {
        await this.kafkaProducer.send({
          topic: 'inventory-reservations',
          messages: [
            {
              key: orderId,
              value: JSON.stringify({
                orderId,
                productId: item.productId,
                quantity: item.quantity,
              }),
            },
          ],
        });
      }

      // Update order status
      await this.orderRepository.updateStatus(orderId, OrderStatus.PROCESSING);

      // Emit event
      await this.eventBus.emit('OrderProcessingStarted', {
        orderId,
        timestamp: new Date(),
      });
    } catch (error) {
      // Handle failure
      await this.eventStore.saveEvent({
        type: 'OrderProcessingFailed',
        orderId,
        error: error.message,
        timestamp: new Date(),
      });

      await this.orderRepository.updateStatus(orderId, OrderStatus.FAILED);

      throw error;
    }
  }
}
```

### Test Implementation

```typescript
// order-processor.service.spec.ts
describe('OrderProcessorService', () => {
  let service: OrderProcessorService;
  let eventBus: jest.Mocked<EventBus>;
  let kafkaProducer: jest.Mocked<Producer>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let eventStore: jest.Mocked<EventStore>;

  beforeEach(async () => {
    // Create mocks
    eventBus = {
      emit: jest.fn(),
    } as any;

    kafkaProducer = {
      send: jest.fn(),
    } as any;

    orderRepository = {
      updateStatus: jest.fn(),
    } as any;

    eventStore = {
      saveEvent: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        OrderProcessorService,
        {
          provide: 'EVENT_BUS',
          useValue: eventBus,
        },
        {
          provide: 'KAFKA_PRODUCER',
          useValue: kafkaProducer,
        },
        {
          provide: OrderRepository,
          useValue: orderRepository,
        },
        {
          provide: EventStore,
          useValue: eventStore,
        },
      ],
    }).compile();

    service = module.get<OrderProcessorService>(OrderProcessorService);
  });

  describe('handleOrderCreated', () => {
    const mockEvent: OrderCreatedEvent = {
      orderId: 'order1',
      items: [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod2', quantity: 1 },
      ],
    };

    it('should process order successfully', async () => {
      // Arrange
      const startTime = new Date();
      jest.useFakeTimers().setSystemTime(startTime);

      // Act
      await service.handleOrderCreated(mockEvent);

      // Assert
      expect(eventStore.saveEvent).toHaveBeenCalledWith({
        type: 'OrderProcessingStarted',
        orderId: mockEvent.orderId,
        timestamp: startTime,
      });

      expect(kafkaProducer.send).toHaveBeenCalledTimes(2);
      expect(kafkaProducer.send).toHaveBeenCalledWith({
        topic: 'inventory-reservations',
        messages: [
          {
            key: mockEvent.orderId,
            value: JSON.stringify({
              orderId: mockEvent.orderId,
              productId: 'prod1',
              quantity: 2,
            }),
          },
        ],
      });

      expect(orderRepository.updateStatus).toHaveBeenCalledWith(
        mockEvent.orderId,
        OrderStatus.PROCESSING,
      );

      expect(eventBus.emit).toHaveBeenCalledWith('OrderProcessingStarted', {
        orderId: mockEvent.orderId,
        timestamp: startTime,
      });
    });

    it('should handle Kafka producer errors', async () => {
      // Arrange
      const kafkaError = new Error('Kafka connection failed');
      kafkaProducer.send.mockRejectedValue(kafkaError);

      // Act & Assert
      await expect(service.handleOrderCreated(mockEvent)).rejects.toThrow(
        kafkaError,
      );

      expect(eventStore.saveEvent).toHaveBeenCalledWith({
        type: 'OrderProcessingFailed',
        orderId: mockEvent.orderId,
        error: 'Kafka connection failed',
        timestamp: expect.any(Date),
      });

      expect(orderRepository.updateStatus).toHaveBeenCalledWith(
        mockEvent.orderId,
        OrderStatus.FAILED,
      );
    });

    it('should handle partial failures', async () => {
      // Arrange
      kafkaProducer.send
        .mockResolvedValueOnce(undefined) // First item succeeds
        .mockRejectedValueOnce(new Error('Failed')); // Second item fails

      // Act & Assert
      await expect(service.handleOrderCreated(mockEvent)).rejects.toThrow();

      expect(eventStore.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OrderProcessingFailed',
        }),
      );
    });

    it('should maintain event order', async () => {
      // Arrange
      const events: any[] = [];
      eventStore.saveEvent.mockImplementation((event) => {
        events.push(event);
        return Promise.resolve();
      });

      // Act
      try {
        await service.handleOrderCreated(mockEvent);
      } catch (error) {
        // Ignore error
      }

      // Assert
      expect(events[0].type).toBe('OrderProcessingStarted');
      expect(events[1]?.type).toBe('OrderProcessingFailed');
    });
  });
});
```

### Key Testing Points

1. **Event Handling**

   - Event order verification
   - Event store integration
   - Event bus communication

2. **Kafka Integration**

   - Producer testing
   - Message format validation
   - Error handling

3. **Distributed Systems Testing**
   - Partial failures
   - System consistency
   - Event sourcing

## 4. Testing Best Practices for Complex Systems

1. **Isolation**

   ```typescript
   // Good: Isolate external services
   const mockKafka = createMockKafkaProducer({
     shouldFailPartially: true,
     failureRate: 0.3,
   });

   // Bad: Using real Kafka in tests
   const realKafka = new KafkaProducer(config);
   ```

2. **Error Simulation**

   ```typescript
   // Good: Simulate various error scenarios
   it('should handle network partition', async () => {
     mockGrpcClient.simulateNetworkPartition();
     await expect(service.call()).rejects.toThrow(NetworkError);
   });
   ```

3. **Timing Issues**

   ```typescript
   // Good: Control time in tests
   jest.useFakeTimers();
   service.startProcess();
   jest.advanceTimersByTime(5000);
   expect(service.status).toBe('completed');
   ```

4. **Transaction Testing**
   ```typescript
   // Good: Verify transaction boundaries
   expect(transaction.begin).toHaveBeenCalledBefore(kafkaProducer.send);
   expect(transaction.commit).toHaveBeenCalledAfter(eventStore.save);
   ```

## Next Steps

1. Study the examples in detail
2. Implement similar patterns in your tests
3. Adapt patterns to your specific use cases
4. Consider edge cases in distributed systems
