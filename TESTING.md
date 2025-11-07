# Testing Guide

This project uses [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) with Playwright for automated testing.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located alongside the source files with a `.test.ts` extension:

```
src/
├── utils/
│   ├── energy-flow-calculator.ts
│   ├── energy-flow-calculator.test.ts    ✅ Tests
│   ├── power-calculations.ts
│   ├── power-calculations.test.ts        ✅ Tests
│   └── unit-formatter.ts
│       └── unit-formatter.test.ts        ✅ Tests
├── sensor-manager.ts
└── sensor-manager.test.ts                ✅ Tests
```

## Test Coverage

Current test coverage focuses on critical business logic:

### ✅ Fully Tested Modules

#### `unit-formatter.ts`
- Power value formatting (W, kW, MW)
- Energy value formatting (Wh, kWh, MWh)
- Percentage formatting
- Display string formatting
- Negative value handling

#### `power-calculations.ts`
- Category power calculations
- Circuit remainder calculations
- Total consumption calculations
- Particle spawn rate and speed calculations
- Sensor staleness detection
- Efficiency and self-sufficiency calculations
- Grid/battery flow direction detection
- Battery time remaining calculations
- Time formatting (hours, minutes)

#### `energy-flow-calculator.ts`
- Solar flow routing (to battery, grid, hub)
- Battery flow routing (to grid, hub)
- Grid flow routing (to battery, hub)
- Complex multi-source scenarios
- Edge cases (zero values, threshold handling)
- Flow color assignment
- Real-world scenario validation

#### `sensor-manager.ts`
- Sensor subscription and updates
- Power value retrieval
- Percentage value retrieval
- Stale sensor detection
- Unavailable sensor handling
- Last valid value caching
- State refresh and clearing
- Numeric state parsing
- Unit of measurement handling

## Writing Tests

Tests use Chai assertions from `@open-wc/testing`:

```typescript
import { expect } from '@open-wc/testing';
import { formatPower } from './unit-formatter';

describe('formatPower', () => {
  it('should format watts for values < 1000', () => {
    expect(formatPower(500)).to.deep.equal({ value: 500, unit: 'W' });
  });

  it('should format kilowatts for values >= 1000', () => {
    expect(formatPower(1500)).to.deep.equal({ value: 1.5, unit: 'kW' });
  });
});
```

### Test Patterns

**Arrange-Act-Assert**
```typescript
it('should calculate category power', () => {
  // Arrange
  const devices = [
    { categoryId: 'kitchen', powerWatts: 100 },
    { categoryId: 'kitchen', powerWatts: 200 },
  ];

  // Act
  const total = calculateCategoryPower(devices, 'kitchen');

  // Assert
  expect(total).to.equal(300);
});
```

**Edge Cases**
```typescript
it('should return 0 for empty array', () => {
  expect(calculateTotalConsumption([])).to.equal(0);
});

it('should handle negative values', () => {
  expect(formatPower(-1500)).to.deep.equal({ value: -1.5, unit: 'kW' });
});
```

**Mock Objects**
```typescript
const mockHass: HomeAssistant = {
  states: {
    'sensor.test': {
      entity_id: 'sensor.test',
      state: '1000',
      attributes: { unit_of_measurement: 'W' },
      last_updated: new Date().toISOString(),
    },
  },
  connection: { subscribeEntities: () => () => {} },
  callService: async () => {},
};
```

## Coverage Thresholds

The project aims for high coverage on critical paths:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

View coverage report after running:
```bash
npm run test:coverage
```

Coverage report is generated in `coverage/` directory.

## Continuous Integration

Tests should be run automatically in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Test Configuration

See `web-test-runner.config.js` for configuration:
- Browser: Chromium (via Playwright)
- Timeout: 5 seconds per test
- TypeScript support via esbuild
- Coverage tracking enabled

## Future Test Coverage

Areas that could benefit from additional testing:

- **UI Components** (`energy-flow-card.ts`, `config-editor.ts`)
  - Requires DOM testing with `@open-wc/testing` fixtures
  - User interaction simulation
  - Render validation

- **Canvas Rendering** (`particle-system.ts`, `node-renderer.ts`, `sankey-renderer.ts`)
  - Canvas mock required
  - Visual regression testing
  - Animation frame handling

- **Layout Engine** (`layout-engine.ts`)
  - d3-force simulation testing
  - Collision detection validation
  - Position calculations

## Debugging Tests

**Run single test file:**
```bash
npx web-test-runner src/utils/unit-formatter.test.ts
```

**Enable debug mode:**
```bash
npx web-test-runner --manual
```
Opens browser in debug mode for step-through debugging.

**View test output:**
```bash
npm test -- --watch
# Tests auto-rerun on file save with detailed output
```

## Best Practices

1. ✅ **Test behavior, not implementation** - Focus on what the code does, not how
2. ✅ **Use descriptive test names** - `it('should return 0 for empty array')`
3. ✅ **Test edge cases** - Zero, negative, null, undefined, empty arrays
4. ✅ **Keep tests focused** - One assertion per test when possible
5. ✅ **Use beforeEach for setup** - Initialize common test data
6. ✅ **Mock external dependencies** - Don't rely on Home Assistant in tests
7. ✅ **Write tests first** (TDD) - For new features, write failing test first

## Resources

- [Web Test Runner Docs](https://modern-web.dev/docs/test-runner/overview/)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)
- [Open Web Components Testing](https://open-wc.org/docs/testing/testing-package/)
- [Playwright](https://playwright.dev/)
