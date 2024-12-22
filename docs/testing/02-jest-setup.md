# Jest Configuration and Setup

## Introduction to Jest

Jest is a delightful JavaScript/TypeScript testing framework designed to ensure correctness of any JavaScript codebase. It provides a complete and ready to set-up JavaScript testing solution.

## Project Setup

### 1. Installation

In our NatureNest backend, Jest is already set up with the following dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "29.5.14",
    "jest": "29.7.0",
    "jest-mock-extended": "^4.0.0-beta1",
    "ts-jest": "29.2.5"
  }
}
```

To set up Jest in a new project:

```bash
# Install Jest and related packages
yarn add -D jest @types/jest ts-jest
```

### 2. Jest Configuration

Our project uses a dedicated `jest.config.js` file:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/apps/$1',
  },
};
```

Let's break down each configuration option:

#### moduleFileExtensions

- Specifies which file extensions Jest should look for
- In our case: JavaScript, JSON, and TypeScript files

#### rootDir

- The root directory for Jest to find files
- Set to project root ('.')

#### testRegex

- Pattern to find test files
- `.*\\.spec\\.ts$` matches files ending with `.spec.ts`

#### transform

- How to transform files before testing
- Uses `ts-jest` to transform TypeScript files

#### collectCoverageFrom

- Which files to include in coverage reports
- Includes all TypeScript and JavaScript files

#### coverageDirectory

- Where to store coverage reports
- Set to './coverage'

#### testEnvironment

- The test environment to use
- 'node' for Node.js applications

#### roots

- Where to look for test files
- Set to '<rootDir>/apps/' for our monorepo structure

#### moduleNameMapper

- Maps module paths for imports
- Helps resolve '@app' aliases to actual paths

### 3. Package.json Scripts

Our project includes several test-related scripts:

```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "test:watch": "jest --config jest.config.js --watch",
    "test:cov": "jest --config jest.config.js --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

Script explanations:

- `test`: Run all tests once
- `test:watch`: Run tests in watch mode (rerun on file changes)
- `test:cov`: Run tests and generate coverage report
- `test:debug`: Run tests in debug mode

### 4. Test File Structure

In our project, test files follow a specific naming convention:

```
src/
  domain/
    user/
      user.service.ts
      user.service.spec.ts  # Test file for user.service.ts
    auth/
      auth.service.ts
      auth.service.spec.ts  # Test file for auth.service.ts
```

Test files are:

- Located next to the files they test
- Named with `.spec.ts` suffix
- Follow the same directory structure as source files

## Advanced Configuration

### 1. Custom Test Environment

If needed, create a custom test environment:

```typescript
// test-environment.js
const NodeEnvironment = require('jest-environment-node');

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    this.testPath = config.testPath;
  }

  async setup() {
    await super.setup();
    // Add custom setup
  }

  async teardown() {
    // Add custom teardown
    await super.teardown();
  }
}

module.exports = CustomEnvironment;
```

### 2. Custom Matchers

Create custom matchers for specific assertions:

```typescript
// custom-matchers.ts
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

### 3. Global Setup

For global setup before running tests:

```typescript
// jest.setup.ts
beforeAll(() => {
  // Global setup code
});

afterAll(() => {
  // Global cleanup code
});
```

Add to Jest config:

```javascript
module.exports = {
  // ... other config
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
```

## Common Issues and Solutions

### 1. Module Resolution

Problem: Jest can't find modules
Solution: Configure moduleNameMapper

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### 2. TypeScript Path Aliases

Problem: TypeScript path aliases not working
Solution: Update both tsconfig.json and jest.config.js

```javascript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### 3. Environment Variables

Problem: Environment variables not available in tests
Solution: Use jest-environment-node with dotenv

```javascript
// jest.config.js
module.exports = {
  setupFiles: ['<rootDir>/jest.setup.env.js'],
};

// jest.setup.env.js
require('dotenv').config({ path: '.env.test' });
```

## Next Steps

1. Learn about [Mocking with Jest](03-mocking.md)
2. Explore [Test Structure and Best Practices](04-test-structure.md)
3. Study [Real-world Examples](05-real-world-examples.md)
