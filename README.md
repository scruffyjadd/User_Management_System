# User Management System

A full-stack application for managing user accounts and authentication. This system provides a secure and efficient way to handle user registration, authentication, and account management.

## Project Structure

The project is split into two main parts:

- **Backend**: Node.js/Express server with Sequelize ORM for MySQL database
- **Frontend**: Angular application for the user interface

## Tech Stack

### Backend
- **Framework**: Node.js/Express
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Security**: Helmet, Rate Limiting
- **Testing**: Jest

### Frontend
- **Framework**: Angular
- **Language**: TypeScript
- **Styling**: Bootstrap
- **State Management**: RxJS
- **Testing**: Karma, Jasmine

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- MySQL Server
- Angular CLI (for frontend development)

## Backend Setup

1. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` and update the following variables:
     ```
     DB_HOST=153.92.15.31
     DB_PORT=3306
     DB_NAME=u875409848_nudalo
     DB_USER=u875409848_nudalo
     DB_PASSWORD=9T2Z5$3UKkgSYzE
     ```

3. **Set up the database**
   ```powershell
   cd Backend
   .\setup-db.ps1
   ```

4. **Start the server**
   ```powershell
   cd Backend
   npm run start
   ```

The backend will run on `http://localhost:4000` by default.

## Frontend Setup

1. **Install dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   cd Frontend
   npm start
   ```

The frontend will run on `http://localhost:4200` by default.

## API Documentation

API documentation is available at `/api-docs` when the backend server is running.

## Features

- User registration and authentication
- JWT-based authentication
- Password reset functionality
- Email verification
- Role-based access control
- Secure password hashing
- Rate limiting
- API documentation with Swagger

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Rate limiting to prevent brute force attacks
- Helmet middleware for HTTP headers security
- CSRF protection
- XSS protection

## License

MIT

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