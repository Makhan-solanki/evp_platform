# 🎓 ExperienceHub - Student Experience Verification Platform

A modern, full-stack web platform that enables educational organizations to verify student experiences and empowers students to build verified digital portfolios.

![Platform Preview](https://via.placeholder.com/800x400/1e293b/ffffff?text=ExperienceHub+Platform)

## ✨ Features

### 🎓 For Students
- **🏠 Dashboard** - Overview of experiences, verification status, and quick actions
- **👤 Digital Portfolio** - Customizable public profile with verified experiences
- **🎨 Portfolio Builder** - Drag-and-drop interface for portfolio customization
- **📊 Experience Tracking** - Track verification status and manage applications
- **🔔 Real-time Notifications** - Get notified about verification updates
- **📄 PDF Export** - Generate professional portfolio PDFs

### 🏢 For Organizations
- **📈 Analytics Dashboard** - Monitor student engagement and verification metrics
- **👥 Student Management** - Organize and track student participants
- **📋 Verification Queue** - Review and approve experience requests
- **📊 Reporting** - Generate insights and export data
- **📧 Communication Tools** - Message students and request additional information

### 🔐 Security & Authentication
- **Firebase Authentication** - Secure user authentication with email/password and Google OAuth
- **Role-based Access Control** - Separate interfaces for students and organizations
- **Email Verification** - Secure account activation process
- **JWT Token Management** - Secure API authentication with refresh tokens

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **TailwindCSS** for modern, responsive design
- **Redux Toolkit** + RTK Query for state management
- **React Hook Form** + Zod for form validation
- **Framer Motion** for smooth animations
- **React Hot Toast** for notifications

### Backend
- **Node.js** + Express with TypeScript
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and sessions
- **Firebase Admin SDK** for authentication
- **Bull Queue** for background jobs
- **Nodemailer** for email services
- **Cloudinary** for file storage
- **Socket.io** for real-time features

### DevOps & Infrastructure
- **Docker** + Docker Compose for containerization
- **Oracle Cloud Infrastructure (OCI)** for deployment
- **GitHub Actions** for CI/CD
- **Nginx** for reverse proxy and load balancing
- **PostgreSQL** for data persistence
- **Redis** for caching and job queues

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Firebase project setup
- PostgreSQL database
- Oracle Cloud Infrastructure account (for production deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/experience-verification-platform.git
cd experience-verification-platform
```

### 2. Environment Setup
```bash
# Copy environment files
cp env.example .env
cp client/env.example client/.env
cp server/env.example server/.env

# Configure your environment variables
# Edit .env files with your Firebase, database, and other service credentials
```

### 3. Development with Docker
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 4. Manual Development Setup
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Setup database
cd server
npx prisma migrate dev
npx prisma generate

# Start development servers
npm run dev  # In server directory
npm run dev  # In client directory (separate terminal)
```

## 🐳 Docker Commands

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Rebuild services
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f [service-name]

# Execute commands in containers
docker-compose -f docker-compose.dev.yml exec backend-dev npm run prisma:migrate
docker-compose -f docker-compose.dev.yml exec frontend-dev npm run build
```

### Production
```bash
# Build and start production environment
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d
```

## ☁️ Oracle Cloud Infrastructure Deployment

### Prerequisites
- Oracle Cloud Infrastructure account
- OCI CLI installed and configured
- Docker images pushed to Oracle Container Registry (OCIR)

### 1. Setup Oracle Container Registry
```bash
# Login to OCIR
docker login <region>.ocir.io

# Tag your images
docker tag experiencehub-client:latest <region>.ocir.io/<tenancy>/<repo>/experiencehub-client:latest
docker tag experiencehub-server:latest <region>.ocir.io/<tenancy>/<repo>/experiencehub-server:latest

# Push images to OCIR
docker push <region>.ocir.io/<tenancy>/<repo>/experiencehub-client:latest
docker push <region>.ocir.io/<tenancy>/<repo>/experiencehub-server:latest
```

### 2. Deploy to OCI Container Instances
```bash
# Create container instances
oci container-instances container-instance create \
  --display-name experiencehub-client \
  --availability-domain <availability-domain> \
  --compartment-id <compartment-id> \
  --containers '[{"imageUrl": "<region>.ocir.io/<tenancy>/<repo>/experiencehub-client:latest", "displayName": "client"}]' \
  --shape <shape> \
  --subnet-id <subnet-id>

oci container-instances container-instance create \
  --display-name experiencehub-server \
  --availability-domain <availability-domain> \
  --compartment-id <compartment-id> \
  --containers '[{"imageUrl": "<region>.ocir.io/<tenancy>/<repo>/experiencehub-server:latest", "displayName": "server"}]' \
  --shape <shape> \
  --subnet-id <subnet-id>
```

### 3. Setup Load Balancer
```bash
# Create load balancer
oci lb load-balancer create \
  --compartment-id <compartment-id> \
  --display-name experiencehub-lb \
  --shape-name <shape> \
  --subnet-ids '["<subnet-id>"]'

# Configure backend sets and listeners
# (See OCI documentation for detailed steps)
```

### 4. Database Setup
```bash
# Create Oracle Database instance
oci db autonomous-database create \
  --compartment-id <compartment-id> \
  --db-name experiencehub \
  --cpu-core-count 1 \
  --data-storage-size-in-tbs 1 \
  --db-workload OLTP \
  --display-name experiencehub-db
```

## 📁 Project Structure

```
experience-verification-platform/
├── client/                     # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/           # UI components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── organization/ # Organization pages
│   │   │   └── student/      # Student pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── Dockerfile            # Production build
│   ├── Dockerfile.dev        # Development build
│   └── nginx.conf            # Nginx configuration
├── server/                    # Node.js backend
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── websocket/        # Socket.io handlers
│   ├── tests/                # Test files
│   ├── Dockerfile            # Production build
│   └── Dockerfile.dev        # Development build
├── docker-compose.yml        # Production Docker Compose
├── docker-compose.dev.yml    # Development Docker Compose
└── README.md                # This file
```

## 🔧 Environment Variables

### Frontend (.env)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_service_account_email

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
```

## 🚀 Deployment

### Production Deployment
1. **Configure Environment Variables**
   ```bash
   # Set production environment variables
   cp env.example .env
   # Edit .env with production values
   ```

2. **Build and Deploy**
   ```bash
   # Build and start production containers
   docker-compose up -d

   # Run database migrations
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Set up Reverse Proxy** (Optional)
   ```bash
   # Use included Nginx configuration
   docker-compose --profile production up -d
   ```

### CI/CD with GitHub Actions
The project includes automated CI/CD pipelines:
- **Testing**: Runs tests on every push and PR
- **Security**: Vulnerability scanning with Trivy
- **Building**: Creates Docker images
- **Deployment**: Automated deployment to staging/production

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Backend Tests
```bash
cd server
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:e2e       # End-to-end tests
```

### Docker Testing
```bash
# Run tests in containers
docker-compose -f docker-compose.dev.yml exec frontend-dev npm test
docker-compose -f docker-compose.dev.yml exec backend-dev npm test
```

## 📊 Monitoring & Debugging

### Development Tools
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Database Admin**: `http://localhost:8080` (pgAdmin)
- **Redis Manager**: `http://localhost:8081` (Redis Commander)
- **Email Testing**: `http://localhost:8025` (Mailhog)

### Production Monitoring
- Health checks at `/health` endpoints
- Structured logging with Winston
- Error tracking with Sentry (optional)
- Performance monitoring with built-in metrics

## 🔧 Recent Updates

### ✅ Fixed Issues
- **Profile Image Crashes**: Implemented robust error handling for profile images with fallback icons
- **React Rendering Errors**: Fixed object rendering issues in Students component
- **Image Loading**: Created reusable Image component with error handling
- **Data Structure**: Resolved naming conflicts in student data structure

### 🆕 New Features
- **Error-Resilient Images**: All images now have fallback handling
- **Improved UI Components**: Enhanced Image component with loading states
- **Better Error Boundaries**: More robust error handling throughout the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- Prisma for database management
- TailwindCSS for beautiful styling
- Oracle Cloud Infrastructure for hosting
- The open-source community for amazing tools

---

**Built with ❤️ for educational institutions and students worldwide**
