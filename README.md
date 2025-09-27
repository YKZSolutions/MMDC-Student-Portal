# MMDC Student Portal

A comprehensive Learning Management System (LMS) designed for educational institutions, built with modern web technologies to facilitate student enrollment, course management, and academic administration.

## 🎯 Overview

The MMDC Student Portal is a full-stack web application that provides a complete student management solution including:

- **Student Management**: User registration, profile management, and academic records
- **Course Management**: Course creation, enrollment, and curriculum tracking
- **Learning Management System**: Module delivery, assignments, quizzes, and progress tracking
- **Administrative Tools**: User management, billing, notifications, and reporting
- **Grade Management**: Assignment grading, gradebook, and academic performance tracking

## 🏗️ Architecture

This project follows a monorepo structure with clearly separated frontend and backend services:

```
├── frontend/          # React + TypeScript frontend application
├── backend/           # NestJS + Prisma backend API
├── supabase/         # Database configuration and migrations
├── cypress/          # End-to-end testing
├── n8n/             # Workflow automation
└── scripts/         # Utility scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Mantine UI Components
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Rich Text Editor**: BlockNote

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **API Documentation**: Swagger/OpenAPI with Scalar
- **File Storage**: Supabase Storage
- **Payment Processing**: PayMongo integration
- **Testing**: Jest for unit/integration testing

### Infrastructure & DevOps
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Containerization**: Docker with Docker Compose
- **Package Manager**: pnpm with workspaces
- **Testing**: Cypress for E2E testing
- **API Generation**: OpenAPI TypeScript code generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- PostgreSQL (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YKZSolutions/MMDC-Student-Portal.git
   cd MMDC-Student-Portal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in both `backend/` and `supabase/` directories based on the provided `.env.example` files.

4. **Start Supabase locally** (optional for local development)
   ```bash
   pnpm supabase
   ```

5. **Generate Prisma client and API types**
   ```bash
   pnpm run dev:prepare
   ```

6. **Start the development servers**
   ```bash
   # Start both frontend and backend
   pnpm run dev
   
   # Or start individually
   pnpm frontend  # Frontend only
   pnpm backend   # Backend only
   ```

### Database Setup

1. **Run database migrations**
   ```bash
   pnpm --filter backend prisma-gen
   ```

2. **Seed the database** (optional)
   ```bash
   pnpm run db:seed
   ```

## 📝 Available Scripts

### Root Level Commands
- `pnpm run dev` - Start both frontend and backend in development mode
- `pnpm run dev:local` - Start with local Supabase instance
- `pnpm run dev:prepare` - Generate Prisma client and API types
- `pnpm run backend:test` - Run backend E2E tests
- `pnpm run cypress` - Open Cypress test runner

### Frontend Commands
- `pnpm frontend` - Start frontend development server
- `pnpm frontend:api` - Generate TypeScript API client

### Backend Commands
- `pnpm backend` - Start backend development server
- `pnpm backend:prisma-gen` - Generate Prisma client
- `pnpm backend:api` - Generate OpenAPI specification

## 🏛️ Project Structure

### Frontend (`/frontend`)
```
src/
├── components/       # Reusable UI components
├── features/        # Feature-based modules
│   ├── auth/        # Authentication
│   ├── courses/     # Course management
│   ├── user-management/ # User administration
│   └── modals/      # Modal components
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
├── pages/           # Route components
├── routes/          # File-based routing
└── utils/           # Utility functions
```

### Backend (`/backend`)
```
src/
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── users/       # User management
│   ├── lms/         # Learning management system
│   └── billing/     # Payment and billing
├── common/          # Shared utilities
├── config/          # Configuration
├── generated/       # Auto-generated code
├── lib/             # Libraries and utilities
└── middleware/      # Custom middleware
```

## 🔐 Authentication & Authorization

The application uses Supabase Auth with role-based access control:

- **Student**: Access to enrolled courses, assignments, and grades
- **Mentor/Teacher**: Course management, grading, and student progress
- **Admin**: Full system access, user management, and system configuration

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Students, mentors, and administrators
- **Courses**: Academic courses and curriculum
- **Modules**: Course content and learning materials
- **Assignments**: Student assignments and submissions
- **Grades**: Academic performance tracking
- **Bills**: Student billing and payment records

## 🧪 Testing

### Unit & Integration Tests
```bash
# Backend tests
pnpm --filter backend test
pnpm --filter backend test:e2e

# Frontend tests
pnpm --filter frontend test
```

### End-to-End Tests
```bash
# Open Cypress test runner
pnpm cypress

# Run tests headlessly
pnpm --filter cypress cy:run
```

## 🚀 Deployment

### Development
The application supports both cloud and local development environments:
- **Cloud**: Uses Supabase cloud services
- **Local**: Uses local Supabase instance via Docker

### Production
- Backend can be containerized using the provided Dockerfile
- Frontend builds to static assets for deployment to any web server
- Database migrations are managed through Prisma

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Follow conventional commit messages
- Update documentation as needed

## 📚 API Documentation

When the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:3001/api`
- Scalar Documentation: `http://localhost:3001/api/json`

## 🔧 Environment Variables

### Backend
- `DATABASE_CLOUD_URL` - PostgreSQL connection string
- `DIRECT_CLOUD_URL` - Direct database connection
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase service key
- `PAYMONGO_PUBLIC_KEY` - PayMongo public key
- `PAYMONGO_SECRET_KEY` - PayMongo secret key

### Frontend
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API base URL

## 📋 Requirements

- Node.js 18 or higher
- pnpm 9 or higher
- PostgreSQL 17 or higher
- Docker (for local Supabase)

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

Developed by YKZ Solutions for educational institutions.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is an active development project. Features and documentation may change as the project evolves.