<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install

# generate prisma schema
$ yarn migration:generate
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev:main
# or
$ yarn start:dev:main

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Data Flow Layers

The backend implements several layers to handle data flow from frontend to backend:

### 1. DTOs (Data Transfer Objects)

- Located in `*.dto.ts` files
- Define the shape of data being transferred
- Include validation rules using class-validator decorators
- Examples:
  - Request DTOs: `CreatePropertyDto`, `UpdateUserDto`
  - Response DTOs: `PropertyResponseDto`, `UserResponseDto`

### 2. Guards

- Located in `*.guard.ts` files
- Protect routes and handle authentication/authorization
- Examples:
  - `JwtAuthGuard`: Validates JWT tokens
  - `RolesGuard`: Checks user roles and permissions

### 3. Interceptors

- Located in `*.interceptor.ts` files
- Transform data before/after request handling
- Examples:
  - `TransformInterceptor`: Formats response data
  - `LoggingInterceptor`: Logs request/response data

### 4. Pipes (Optional)

- Located in `*.pipe.ts` files
- Transform and validate input data at the parameter level
- Execute just before a method is invoked
- Can transform primitive values (like converting string to number)
- Examples:
  - `ValidationPipe`: Validates incoming DTOs against their class-validator decorators
  - `ParseIntPipe`: Converts string parameters to integers
  - `ParseBoolPipe`: Converts string parameters to booleans

#### DTOs vs Pipes: Key Differences

1. **Purpose**:

   - DTOs: Define data structure and validation rules for entire request/response bodies
   - Pipes: Transform or validate individual parameters and apply transformations

2. **Scope**:

   - DTOs: Handle complete objects/request bodies
   - Pipes: Work on individual parameters or method arguments

3. **Timing**:

   - DTOs: Validated during request body processing
   - Pipes: Execute just before method execution

4. **Example Usage**:

   ```typescript
   // DTO Example - Handles complete object
   class CreateUserDto {
     @IsString()
     name: string;

     @IsEmail()
     email: string;
   }

   // Pipe Example - Transforms single parameter
   @Get(':id')
   findOne(@Param('id', ParseIntPipe) id: number) {
     // id is guaranteed to be a number
   }
   ```

### 5. Controllers

- Located in `*.controller.ts` files
- Handle HTTP requests
- Use decorators to define routes and HTTP methods
- Apply guards, interceptors, and pipes

### 6. Services

- Located in `*.service.ts` files
- Contain business logic
- Interact with the database through Prisma
- Handle data processing and validation

### 7. Entities/Models

- Defined in `prisma/schema.prisma`
- Represent database structure
- Map to database tables

### Data Flow Example

1. Frontend sends HTTP request with data
2. Guards check authentication/authorization
3. DTOs validate incoming data
4. Pipes transform data if needed
5. Controllers receive the request
6. Services process the business logic
7. Prisma handles database operations
8. Response flows back through interceptors
9. Formatted data returns to frontend

## Other Useful Commands

```bash
# generate a new application
$ nest g app <service-name>
# example:
$ nest g app main-service

# generate a new module (navigate to module location first)
$ cd apps/main-service/src/domain && nest g module <module-name>
# example:
$ cd apps/main-service/src/domain && nest g module amenity

# install new dependencies
$ yarn add <package> -W
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Testing

### Unit Tests

```bash
# run all tests
$ yarn test

# run tests in watch mode
$ yarn test:watch

# run tests with coverage
$ yarn test:cov

# run specific test file
$ yarn test path/to/file.spec.ts
# example:
$ yarn test apps/main-service/src/domain/property/property.service.spec.ts
```

### Important Notes

- Tests use mock database, so they won't affect your development/production database
- Tests are located next to the files they test (e.g., `service.ts` -> `service.spec.ts`)
- Use `jest.config.js` for test configuration
- Coverage reports are generated in the `./coverage` directory

### Writing Tests

Basic test structure:

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockContext: MockContext;

  beforeEach(async () => {
    const { module, mockContext: mc } = await createTestingModule([
      ServiceName,
    ]);
    service = module.get<ServiceName>(ServiceName);
    mockContext = mc;
  });

  // Your test cases here
});
```
