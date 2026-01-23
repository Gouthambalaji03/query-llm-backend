# Query LLM:

An intelligent agent that can perform database queries and provide insights.

## Overview

Query LLM is a full-stack application that combines the power of AI with database querying capabilities to deliver intelligent insights. The application features a modern web interface, a robust API server, and an AI-powered backend.

## Tech Stack

### Web Server
Built with modern web technologies using Bun as the package manager:

- **Next.js** - React framework for production
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **shadcn/ui** - Beautiful and accessible UI components
- **react-hook-form** - Performant forms with easy validation
- **react-query** - Powerful data synchronization

### API Server
RESTful API backend:

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe development
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **Firebase Auth** - Authentication service
- **dotenv** - Environment variable management
- **axios** - HTTP client
- **cors** - Cross-origin resource sharing

### AI Server
Intelligent query processing:

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe development
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **Prisma** - Database ORM
- **Vercel AI SDK** - AI integration toolkit
- **DB Query Tool** - Custom database querying capabilities

## Deployment

- **Vercel** - Web server hosting
- **Render** - API and AI server hosting

## Getting Started

### Prerequisites

- Bun (for web server)
- Node.js (for API and AI servers)
- PostgreSQL
- Firebase account (for authentication)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd query-llm-fe

# Install dependencies for web server
bun install

# Install dependencies for API server
cd api-server
npm install

# Install dependencies for AI server
cd ai-server
npm install
```

### Environment Variables

Create `.env` files in each server directory with the necessary configuration:

- Database connection strings
- Firebase authentication credentials
- API keys for AI services

### Running Locally

```bash
# Start web server
bun dev

# Start API server
npm run dev

# Start AI server
npm run dev
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]