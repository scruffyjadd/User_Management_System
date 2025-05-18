# Employee Management System - Backend API

This is a full-stack employee management system built with Node.js, Express, MySQL, and Angular. The backend provides a RESTful API for user authentication, employee management, department management, workflow tracking, and request handling.

## Key Features

- **User Authentication**
  - Email-based registration with verification
  - JWT authentication with access + refresh tokens
  - Role-based access control (Admin/User)
  - Password reset functionality

- **Employee Management**
  - CRUD operations for employees
  - Department assignment and transfers
  - Employee status tracking (active, on leave, terminated)

- **Department Management**
  - Create and manage departments
  - Track employee count and department hierarchy

- **Workflow System**
  - Track employee-related actions (transfers, status changes, etc.)
  - Status management (Pending/Approved/Rejected)
  - Audit trail of all actions

- **Request System**
  - Employees can submit requests (equipment, leave, resources)
  - Admin approval workflow
  - Status tracking for requests

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting
- **Email**: Nodemailer
- **Validation**: Joi, Express Validator

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
- MySQL Server (v5.7 or later)
- Git (for version control)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Full-Stack-App.git
cd Full-Stack-App/Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=4000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=employee_management
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   
   # Email Configuration (for password reset, etc.)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_ethereal_username
   SMTP_PASSWORD=your_ethereal_password
   EMAIL_FROM=noreply@employeeapp.com
   
   # API Configuration
   API_BASE_URL=/api
   API_DOCS_URL=/api-docs
   
   # Security
   CORS_ORIGINS=http://localhost:4200,http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX=100
   
   # Logging
   LOG_LEVEL=debug
   LOG_TO_FILE=true
   ```

### 4. Database Setup

1. Create a new MySQL database:
   ```sql
   CREATE DATABASE employee_management;
   ```

2. Run database migrations:
   ```bash
   npm run migrate
   ```

3. (Optional) Seed the database with initial data:
   ```bash
   npm run seed
   ```

### 5. Start the Development Server

```bash
# Using npm script
npm run start:dev

# Or using the PowerShell script (Windows)
.\start-server.ps1
```

The API will be available at `http://localhost:4000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:4000/api-docs`
- API Base URL: `http://localhost:4000/api`

## Project Structure

```
backend/
├── config/                 # Configuration files
├── controllers/            # Route controllers
├── middleware/             # Custom middleware
├── models/                 # Database models
├── routes/                 # Route definitions
├── services/               # Business logic
├── utils/                  # Utility classes and functions
├── validations/            # Request validation schemas
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── server.js               # Application entry point
└── package.json            # Project metadata and dependencies
```

## Available Scripts

- `npm start` - Start the production server
- `npm run start:dev` - Start the development server with hot-reload
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with initial data
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Rate limiting is enabled to prevent brute force attacks
- CORS is configured to only allow requests from trusted origins
- Helmet middleware is used to secure HTTP headers
- Input validation is implemented for all API endpoints

## License

MIT
