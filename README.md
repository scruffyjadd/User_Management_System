# User Management Frontend

A modern, responsive frontend application built with Angular for handling user authentication and management.

## Tech Stack

- **Framework**: Angular 17.3.0
- **Language**: TypeScript
- **UI Framework**: Bootstrap 5.3.5
- **State Management**: RxJS
- **Testing**:
  - Unit Tests: Karma + Jasmine
  - E2E Tests: Protractor
- **Build Tool**: Angular CLI

## Prerequisites

- Node.js v16+
- npm v8+
- Angular CLI

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200`.

3. **Configure API URL**
   - Update `src/environments/environment.ts` with your backend API URL
   - Default: `http://localhost:4000`

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

# Start the development server
ng serve

# Or use the start script
npm start
```

## Project Structure

```
src/app/
├── account/          # Authentication related components (login, register, etc.)
├── admin/            # Admin dashboard and management components
├── home/             # Public landing page and home components
├── profile/          # User profile management
├── _components/      # Shared components
├── _helpers/         # Helper services and utilities
├── _models/          # Data models and interfaces
├── _services/        # Core services (authentication, HTTP, etc.)
└── app.module.ts     # Root module configuration
```

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

## Testing

### Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

```bash
# Run tests in watch mode
ng test

# Run tests once and generate coverage report
ng test --no-watch --code-coverage
```

### End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice.

```bash
# Run e2e tests
ng e2e
```

## Code Scaffolding

Use Angular CLI to generate new components, services, and more:

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new module
ng generate module module-name
```

## Linting and Code Formatting

```bash
# Run linter
ng lint

# Fix linting issues automatically
ng lint --fix
```

## Deployment

For production deployment, build the application with the production configuration and deploy the contents of the `dist/` directory to your web server.

## License

MIT
