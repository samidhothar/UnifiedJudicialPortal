# Unified Judicial Portal - Pakistan Courts

A comprehensive digital transformation solution for the Pakistani judicial system, featuring modern glassmorphism UI, role-based access control, and AI-powered legal assistance.

## 🚀 Live Demo

Access the portal at your deployed URL with the demo accounts listed below.

## 🏛️ Portal Overview

The Unified Judicial Portal streamlines legal processes through technology, providing a centralized platform for case management, evidence handling, hearing scheduling, and AI-powered legal brief generation. Built with modern web technologies and designed specifically for the Pakistani judicial system.

### Key Features

- **🎨 Glassmorphism Dark Theme**: Modern UI with backdrop blur effects and role-specific color gradients
- **👥 Multi-Role System**: Four distinct user roles with specialized dashboards
- **⚡ Real-time Updates**: Live case status tracking and notifications
- **🤖 AI Integration**: OpenAI-powered legal brief generation and precedent research
- **💰 Fee Calculator**: Accurate court fee calculations based on Pakistani legal framework
- **🔒 Evidence Vault**: Secure document management with hash verification
- **📅 Smart Scheduling**: Automated hearing management with video conferencing
- **🌐 Multilingual Support**: Urdu and English language options

## 👥 Demo Accounts

### 🏛️ Judge Portal
**Username:** `JDG-001`  
**Password:** `password123`

**Features:**
- Case queue management with priority sorting
- AI-powered legal brief generation
- Evidence viewer with chain-of-custody tracking
- Virtual bench for remote hearings
- Decision making tools with precedent research

---

### 📋 Court Clerk Portal
**Username:** `ali.ahmed`  
**Password:** `password123`

**Features:**
- Intake processing and case vetting
- Fee reconciliation and payment tracking
- Evidence chain-of-custody management with QR scanning
- Scheduling hub for hearing coordination
- Administrative oversight tools

---

### ⚖️ Advocate Portal
**Username:** `ADV-001`  
**Password:** `password123`

**Features:**
- Multi-case management dashboard
- Bulk case filing capabilities
- AI-powered legal research assistance
- Client communication tools
- Court calendar integration

---

### 👤 Citizen Portal
**Username:** `12345-6789012-3`  
**Password:** `123456`

**Features:**
- Case filing wizard with step-by-step guidance
- Real-time case status tracking
- Hearing notifications and reminders
- Fee estimation calculator
- Document upload and management

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom judicial theme
- **Shadcn/UI** components with glassmorphism enhancements
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend Stack
- **Node.js** with Express.js
- **PostgreSQL** with Neon serverless connection
- **Drizzle ORM** for type-safe database operations
- **OpenAI GPT-4o** for AI-powered features
- **Session-based authentication** with PostgreSQL storage

### Key Components

#### 🎨 Glassmorphism Theme System
- **Role-specific gradients**: Citizen (blue), Judge (purple), Clerk (yellow), Advocate (green)
- **Glass cards**: Backdrop blur with transparency effects
- **Dark/Light mode**: Persistent theme switching with localStorage
- **Responsive design**: Mobile-first approach with modern layouts

#### 💰 Fee Calculator
Based on Pakistani legal framework:
- **Court-Fee Act 1870** compliance
- **Finance Act 2024** updated rates
- **Real-time calculations** for different case types
- **Breakdown display** with detailed fee structure

#### 🤖 AI Legal Assistant
Powered by OpenAI GPT-4o:
- **Case brief generation** with key points extraction
- **Precedent research** with relevant case law
- **Legal recommendations** based on case analysis
- **Smart document analysis** for evidence review

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unified-judicial-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The portal will be available at `http://localhost:5000`

## 🔐 Security Features

- **Session-based authentication** with secure cookie handling
- **Role-based access control** with route protection
- **Evidence integrity** through SHA-256 hash verification
- **Data encryption** for sensitive legal documents
- **Audit trails** for all case-related activities

## 📱 Responsive Design

The portal is fully responsive and optimized for:
- **Desktop**: Full-featured dashboards with multi-panel layouts
- **Tablet**: Adaptive layouts with touch-friendly interactions
- **Mobile**: Streamlined interfaces for on-the-go access

## 🌍 Localization

- **Urdu**: Native language support for Pakistani users
- **English**: International standard for legal documentation
- **RTL Support**: Right-to-left text layout for Urdu content

## 🔄 Real-time Features

- **Live notifications** for case updates and hearing schedules
- **Real-time status tracking** with WebSocket connections
- **Instant messaging** between legal professionals
- **Live video conferencing** for remote hearings

## 📊 Analytics & Reporting

- **Case statistics** with visual dashboards
- **Performance metrics** for judicial efficiency
- **Fee collection reports** with financial insights
- **User activity tracking** for system optimization

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── openai.ts          # AI integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── README.md              # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about the portal:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for troubleshooting guides

## 🔮 Future Enhancements

- **Blockchain integration** for immutable evidence records
- **Advanced AI features** with multilingual legal analysis
- **Mobile app** for iOS and Android platforms
- **API integration** with existing court systems
- **Advanced analytics** with machine learning insights

---

**Built with ❤️ for the Pakistani Judicial System**

*Transforming justice through technology*