# Unified Judicial Portal - PoC

## Overview

This is a Proof of Concept for a Unified Judicial Portal built with a modern web stack. The application serves as a comprehensive case management system for the Pakistani judicial system, supporting four distinct user roles: citizens, advocates, judges, and court clerks. The system provides role-based access control, case filing and tracking, evidence management, hearing scheduling, and AI-powered legal assistance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom judicial theme colors and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with TypeScript and ESM modules
- **Framework**: Express.js with session-based authentication
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Session Management**: Express sessions with PostgreSQL storage
- **AI Integration**: OpenAI GPT-4o for legal brief generation

### Database Design
The system uses a relational database with four main entities:
- **Users**: Role-based user management (citizen, advocate, judge, clerk)
- **Cases**: Case information with status tracking and assignments
- **Evidence**: File attachments with verification and type classification
- **Hearings**: Scheduled court sessions with video conferencing support

## Key Components

### Authentication System
- **Session-based Authentication**: Uses Express sessions with PostgreSQL storage
- **Role-based Access Control**: Four distinct user roles with specific permissions
- **Multi-modal Login**: Different authentication methods per role (CNIC+OTP for citizens, credentials for others)

### Case Management
- **Case Filing Wizard**: Step-by-step case submission process for citizens
- **Status Tracking**: Real-time case status updates (filed → pending → in-hearing → decided)
- **Assignment System**: Automatic or manual judge assignment to cases

### Evidence Management
- **Secure Upload**: File upload with hash verification
- **Type Classification**: Document, image, video, and audio evidence types
- **Verification System**: Evidence verification workflow for court clerks

### AI Integration
- **Legal Brief Generation**: OpenAI-powered case analysis and precedent research
- **Smart Recommendations**: AI-generated legal recommendations based on case details
- **Precedent Search**: Automated legal precedent identification

### User Dashboards
- **Citizen Dashboard**: Case filing, status tracking, hearing notifications
- **Advocate Dashboard**: Multi-case management, bulk filing, AI assistance
- **Judge Dashboard**: Cause list management, hearing conduct, decision making
- **Clerk Dashboard**: Intake processing, payment reconciliation, administrative tasks

## Data Flow

1. **User Authentication**: Session-based login with role-specific credentials
2. **Case Creation**: Citizens file cases through guided wizard
3. **Case Assignment**: System assigns cases to judges based on type and availability
4. **Evidence Upload**: Parties upload supporting documents and media
5. **Hearing Scheduling**: Automated or manual hearing date assignment
6. **AI Processing**: Background AI analysis for legal briefs and recommendations
7. **Status Updates**: Real-time case status propagation to all stakeholders

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: OpenAI API for legal analysis
- **UI Components**: Radix UI ecosystem for accessible components
- **Validation**: Zod schema validation library
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database schema management and migrations
- **Vite**: Development server and build tooling
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express backend proxy
- **Database**: Neon development database with automatic migrations
- **Environment Variables**: Local .env file for development secrets

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Database**: Production Neon database with migration support
- **Deployment**: Single-server deployment with static file serving

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `SESSION_SECRET`: Session encryption secret

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 28, 2025**: Implemented sophisticated glassmorphism dark mode theme with backdrop blur effects
- **June 28, 2025**: Created ThemeProvider with localStorage persistence and toggle functionality
- **June 28, 2025**: Enhanced citizen dashboard with glassmorphism cards and status indicators
- **June 28, 2025**: Added comprehensive FeeEstimator component with Pakistani court fee calculations
- **June 28, 2025**: Integrated GlassNavbar with KYC status badges and smart notifications
- **June 28, 2025**: Enhanced case progress visualization with color-coded status system
- **June 27, 2025**: Added comprehensive hearing timeline system with role-based visibility
- **June 27, 2025**: Enhanced seed data with realistic case-specific hearing schedules
- **June 27, 2025**: Implemented HearingTimeline component with case type-specific workflows
- **June 27, 2025**: Fixed authentication polling issue causing blank screens
- **June 27, 2025**: Resolved CaseDetail component crash on undefined status
- **June 27, 2025**: Verified all four role-based login systems working
- **June 27, 2025**: Confirmed case management, evidence vault, and AI integration operational

## Changelog

Changelog:
- June 27, 2025. Initial setup and core functionality completed