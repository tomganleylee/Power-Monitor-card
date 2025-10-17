# Contributing to Energy Flow Card

Thank you for your interest in contributing to the Energy Flow Card project! We welcome contributions from the community.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- A Home Assistant instance for testing

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/energy-flow-card.git
   cd energy-flow-card
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development mode**
   ```bash
   npm run dev
   ```
   This starts Rollup in watch mode - any changes you make will automatically rebuild.

4. **Test in Home Assistant**
   - Copy `dist/energy-flow-card.js` to your Home Assistant `/config/www/` directory
   - Add the card to a dashboard
   - Make changes and refresh your browser to see updates

### Project Structure

```
energy-flow-card/
├── src/
│   ├── energy-flow-card.ts       # Main card component
│   ├── config-editor.ts          # Visual configuration editor
│   ├── types.ts                  # TypeScript type definitions
│   ├── styles.ts                 # Card styles (CSS)
│   ├── sensor-manager.ts         # Sensor state management
│   ├── particle-system.ts        # Particle animation system
│   ├── layout-engine.ts          # Node positioning logic
│   ├── node-renderer.ts          # Canvas rendering for nodes
│   ├── sankey-renderer.ts        # Sankey flow visualization
│   └── utils/                    # Utility functions
├── dist/                         # Built files (generated)
├── examples/                     # Example configurations
├── docs/                         # Documentation and images
├── rollup.config.mjs             # Build configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

### Building

```bash
# Build for production
npm run build

# Build and watch for changes
npm run dev
```

### Code Style

- **TypeScript** - All code should be written in TypeScript with proper types
- **Formatting** - Code is automatically formatted (if you have a formatter configured)
- **Naming Conventions:**
  - Classes: `PascalCase`
  - Functions/Methods: `camelCase`
  - Private methods: `_privateMethod` or use TypeScript `private` keyword
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts`

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Write clean, well-commented code
   - Follow existing code style and patterns
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with device rendering"
   ```

   Use conventional commit messages:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with details about your changes
   - Submit the PR

### Pull Request Guidelines

- **Title:** Use a clear, descriptive title
- **Description:** Explain what changes you made and why
- **Testing:** Describe how you tested your changes
- **Screenshots:** Include screenshots for UI changes
- **Breaking Changes:** Clearly mark any breaking changes
- **Link Issues:** Reference any related issues

### Testing

Before submitting a PR, please test:

1. **Basic Functionality**
   - Card loads without errors
   - Sensors update correctly
   - Animations work smoothly

2. **Edge Cases**
   - Missing sensors
   - Invalid configuration
   - Zero power values
   - Very large power values

3. **Browser Compatibility**
   - Test in Chrome, Firefox, and Safari if possible
   - Test on mobile devices

4. **Performance**
   - Check browser console for errors
   - Monitor CPU usage with many devices
   - Test with update_interval values

### Reporting Bugs

When reporting bugs, please include:

1. Home Assistant version
2. Energy Flow Card version
3. Browser and version
4. Your card configuration (sanitized)
5. Browser console errors (F12 → Console)
6. Screenshots if applicable
7. Steps to reproduce

### Suggesting Features

When suggesting features:

1. Check if the feature already exists or is planned
2. Describe the feature clearly
3. Explain the use case
4. Provide examples or mockups if possible
5. Consider if it fits the scope of the project

### Documentation

If you're adding new features:

1. Update the README.md
2. Add examples to the `examples/` directory
3. Update inline code comments
4. Consider adding to the FAQ section

### Questions?

- **Discussions:** Use [GitHub Discussions](https://github.com/yourusername/energy-flow-card/discussions) for questions
- **Issues:** Use [GitHub Issues](https://github.com/yourusername/energy-flow-card/issues) for bug reports and feature requests
- **Community:** Ask in the [Home Assistant Community Forum](https://community.home-assistant.io/)

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to learn and build great things together.

Thank you for contributing! 🎉
