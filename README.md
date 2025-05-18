# Frontend Application

This is an Angular-based frontend application that provides a user interface for authentication, user management, and profile handling. It's designed to work with the Node.js/Express backend API.

## Tech Stack

- **Framework**: Angular 17.3.0
- **Language**: TypeScript
- **Styling**: Bootstrap 5.3.5
- **State Management**: RxJS (Reactive Extensions for JavaScript)
- **Testing**: 
  - Karma (unit tests)
  - Jasmine (test framework)
  - Protractor (e2e tests)
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later recommended)
- npm (v8 or later)
- Angular CLI (v17.3.0 or later)

## Getting Started

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd Full-Stack-App/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update the environment configuration in `src/environments/` to point to your backend API
   - Default API URL is set to `http://localhost:4000`

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

```bash
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