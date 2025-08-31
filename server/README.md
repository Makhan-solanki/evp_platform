# Experience Verification Platform - Backend

A comprehensive Node.js backend API for the Experience Verification Platform, built with TypeScript, Express, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: Firebase Auth integration with role-based access control
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **File Storage**: Cloudinary integration for secure file uploads and management
- **Real-time Communication**: Socket.io for live notifications and updates
- **Security**: Comprehensive security middleware with rate limiting, input validation, and audit logging
- **Testing**: Jest test suite with comprehensive coverage
- **Documentation**: Complete API documentation with OpenAPI/Swagger

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Admin SDK
- **File Storage**: Cloudinary
- **Caching**: Redis (optional)
- **Real-time**: Socket.io
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Zod schemas

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── schemas/         # Zod validation schemas
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── Dockerfile           # Docker configuration
└── package.json         # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Firebase project with Admin SDK credentials
- Cloudinary account for file storage

### Environment Setup

1. Copy the environment template:
```bash
cp env.example .env
```

2. Fill in your environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/experience_verification"

# Firebase
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npm run db:generate
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Seed the database (optional):
```bash
npm run db:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot reload enabled.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🐳 Docker Setup

### Development with Docker Compose

1. Create your `.env` file with appropriate values
2. Start all services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 5000

### Production Deployment

Build and run the production container:
```bash
docker build -t experience-verification-backend .
docker run -p 5000:5000 --env-file .env experience-verification-backend
```

## 📊 Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Core user accounts with Firebase integration
- **Organizations**: Educational institutions and companies
- **Students**: Student profiles with portfolio management
- **Experiences**: Work experiences, internships, projects, etc.
- **Portfolios**: Student portfolio pages with customization
- **Documents**: File attachments and certificates
- **Notifications**: Real-time notification system
- **Audit Logs**: Complete audit trail for security

View the complete schema in `prisma/schema.prisma`.

## 🔐 Authentication & Security

### Authentication Flow

1. Users authenticate with Firebase on the client
2. Firebase ID tokens are verified on each request
3. User roles and permissions are managed in the database
4. JWT tokens are used for API session management

### Security Features

- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Input sanitization and output encoding
- **CORS**: Configurable cross-origin request handling
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Complete audit trail for all actions

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/verify-email` - Email verification

### Organizations (Coming Soon)
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization

### Students (Coming Soon)
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student profile
- `PUT /api/students/:id` - Update student profile
- `GET /api/students/:id/portfolio` - Get student portfolio

### Experiences (Coming Soon)
- `GET /api/experiences` - List experiences
- `POST /api/experiences` - Create experience
- `PUT /api/experiences/:id` - Update experience
- `DELETE /api/experiences/:id` - Delete experience
- `PUT /api/experiences/:id/verify` - Verify experience

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual service and utility function tests
- **Integration Tests**: API endpoint tests with database
- **Mock Services**: Firebase and Cloudinary service mocks
- **Test Utilities**: Helper functions for test data creation

### Test Database

Tests use a separate test database to avoid conflicts with development data. Configure the test database URL in your environment:

```env
TEST_DATABASE_URL="postgresql://test:test@localhost:5432/test_experience_verification"
```

## 📈 Monitoring & Logging

### Logging

The application uses Winston for structured logging with multiple levels:

- **Error**: Application errors and exceptions
- **Warn**: Warning conditions and security events
- **Info**: General application flow
- **Debug**: Detailed debugging information

Logs are written to:
- Console (development)
- Files (production): `logs/error.log` and `logs/combined.log`

### Health Checks

The application includes health check endpoints:

- `GET /health` - Basic health check with database connectivity
- `GET /api` - API information and available endpoints

### Audit Logging

All user actions are logged for security and compliance:

- User authentication events
- Data modifications
- File operations
- Security events

## 🚀 Deployment

### Environment Configuration

Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL="your-production-database-url"
FIREBASE_PROJECT_ID="your-production-firebase-project"
# ... other production configurations
```

### Database Migrations

Run migrations in production:

```bash
npm run db:migrate:deploy
```

### Production Considerations

- Use a production-grade PostgreSQL instance
- Configure Redis for session storage and caching
- Set up SSL/TLS certificates
- Configure reverse proxy (Nginx)
- Set up monitoring and alerting
- Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for all new features
- Use conventional commit messages
- Update documentation for API changes
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation at `/api/docs`

## 🔄 API Versioning

The API follows semantic versioning. Current version: v1.0.0

- Breaking changes increment the major version
- New features increment the minor version
- Bug fixes increment the patch version
