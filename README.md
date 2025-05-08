# Awesome Express

[![npm version](https://img.shields.io/npm/v/awesome-express.svg)](https://www.npmjs.com/package/awesome-express)
[![License](https://img.shields.io/npm/l/awesome-express.svg)](https://github.com/al0olo/awesome-express/blob/main/LICENSE)

An enhanced Express framework with HTTP/2 support and CLI tools for rapid application development.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
  - [Creating a New Project](#creating-a-new-project)
  - [Generating Components](#generating-components)
  - [Setting up SSL Certificates](#setting-up-ssl-certificates)
  - [Managing Documentation](#managing-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [SSL Certificates](#ssl-certificates)
- [HTTP/2 API](#http2-api)
  - [Basic Usage](#basic-usage)
- [OpenAPI Documentation](#openapi-documentation)
  - [Adding OpenAPI Documentation](#adding-openapi-documentation)
  - [Documenting Routes](#documenting-routes)
  - [Serving Documentation](#serving-documentation)
- [JWT Authentication](#jwt-authentication)
  - [Adding Authentication](#adding-authentication)
  - [Authentication Features](#authentication-features)
  - [Available Endpoints](#available-endpoints)
  - [Protecting Routes](#protecting-routes)
- [License](#license)

## Features

- **HTTP/2 Support**: Built-in HTTP/2 server configuration for Express
- **Dual HTTP/HTTPS**: HTTP for easier local development, HTTPS with HTTP/2 for production
- **CLI Tool**: Quickly generate new projects and components
- **MVC Pattern**: Organized project structure with models, views, and controllers
- **SSL Certificate Management**: Automatic setup with certbot
- **TypeScript Support**: First-class TypeScript support out of the box
- **JWT Authentication**: Ready-to-use JWT authentication with token generation and route protection
- **OpenAPI Documentation**: Automatic API documentation generation from JSDoc comments

## Installation

### Global Installation (Recommended for CLI usage)

```bash
npm install -g awesome-express
```

### Local Installation (For using as a dependency)

```bash
npm install awesome-express
```

Verify installation:

```bash
awesome-express --version
```

## Quick Start

### Creating a New Project

```bash
# Create a new project with default settings
awesome-express new my-app

# Move into project directory
cd my-app

# Start development server
npm run dev
```

### Default Access Points

The project is ready to use with both HTTP and HTTPS:

- HTTP: `http://localhost:3001` (for easy local development)
- HTTPS: `https://localhost:3000` (HTTP/2 enabled)

Development SSL certificates are automatically generated during project creation.

### Project Templates

You can create projects with predefined templates:

```bash
# Create a project with JWT authentication
awesome-express new my-app --include-auth

# Create a project with OpenAPI documentation
awesome-express new my-app --include-openapi

# Create a complete project with all features
awesome-express new my-app --include-auth --include-openapi
```

## CLI Commands

The `awesome-express` CLI provides a suite of commands to streamline development.

### Creating a New Project

```bash
awesome-express new <app-name>
```

Options:
- `-d, --directory <directory>`: Specify a custom directory
- `--skip-install`: Skip installing dependencies
- `--skip-git`: Skip git initialization
- `--include-auth`: Include JWT authentication system
- `--include-openapi`: Include OpenAPI documentation setup

Examples:

```bash
# Create a new project in a custom directory
awesome-express new my-api --directory /path/to/projects

# Create a minimal project (no dependencies installation, no git)
awesome-express new minimal-app --skip-install --skip-git
```

### Generating Components

#### Controllers

```bash
# Generate a controller
awesome-express generate controller UserController

# Short form
awesome-express g controller UserController

# With specific methods
awesome-express g controller UserController --methods=index,show,create,update,delete
```

Generated controller will be located in `src/controllers/UserController.ts` with the specified or default methods.

#### Models

```bash
# Generate a model
awesome-express g model User
```

#### Routes

```bash
# Generate a route
awesome-express g route users
```

Generate JWT authentication:

```bash
awesome-express g auth
```

Generate OpenAPI documentation:

```bash
awesome-express g openapi
```

### Setting up SSL Certificates

For development, self-signed certificates are automatically generated. For production, you can use Let's Encrypt:

```bash
awesome-express certbot -d example.com -e admin@example.com
```

Options:
- `-d, --domain <domain>`: Domain name (required)
- `-e, --email <email>`: Email address for Let's Encrypt notifications (required)

The certificates will be stored in the `certs` directory and the server automatically configured to use them.

### Managing Documentation

```bash
# Serve the OpenAPI documentation UI
awesome-express docs serve

# Generate static OpenAPI specification file
awesome-express docs generate --output openapi.json
```

## Project Structure

When you create a new project, it follows this well-organized structure:

```
.
├── certs/                # SSL certificates
│   ├── localhost.crt     # Development certificate
│   └── localhost.key     # Development key
├── scripts/              # Utility scripts
│   └── generate-dev-certs.sh  # Certificate generation script
├── src/                  # Source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   │   └── homeController.ts  # Example controller
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── public/           # Static files
│   ├── routes/           # Routes definitions
│   │   └── homeRoutes.ts    # Example routes
│   ├── views/            # View templates (for template rendering)
│   ├── app.ts            # Express app setup
│   └── server.ts         # HTTP/2 server entry point
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore configuration
├── package.json          # Node.js dependencies and scripts
├── README.md             # Project documentation
└── tsconfig.json         # TypeScript configuration
```

## Configuration

### Environment Variables

The framework uses environment variables for configuration, loaded via `dotenv`:

```env
# Server ports
PORT=3000             # HTTPS/HTTP2 port
HTTP_PORT=3001        # HTTP port

# Environment
NODE_ENV=development  # development, production, test

# SSL certificates (for production)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d
```

### SSL Certificates

In development mode, self-signed certificates are automatically generated in the `certs` directory. For production, use Let's Encrypt certificates generated via the certbot command.

## HTTP/2 API

The framework provides a simple API for setting up HTTP/2 servers with Express.

### Basic Usage

```typescript
import { createHttp2App, startHttp2Server } from 'awesome-express';

// Create an Express app with HTTP/2 support
const app = createHttp2App();

// Configure your app
app.get('/', (req, res) => {
  res.json({ message: 'Hello from HTTP/2!' });
});

// Start the HTTP/2 server
startHttp2Server(app, {
  cert: '/path/to/cert.pem',
  key: '/path/to/key.pem',
  port: 3000
});
```

## OpenAPI Documentation

The framework provides built-in support for generating OpenAPI documentation from JSDoc comments.

### Adding OpenAPI Documentation

During project creation:
```bash
awesome-express new my-app --include-openapi
```

Or to an existing project:
```bash
awesome-express g openapi
```

### Documenting Routes

Document your routes using JSDoc comments with OpenAPI/Swagger annotations:

```typescript
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', userController.getAllUsers);
```

### Serving Documentation

Serve OpenAPI documentation:

```bash
# Start documentation server
npm run docs

# Or directly
awesome-express docs serve
```

This will start a documentation server that displays your API documentation in an interactive Swagger UI.

Alternatively, you can generate an OpenAPI specification file:

```bash
awesome-express docs generate openapi.json
```

## JWT Authentication

The framework includes a ready-to-use JWT authentication system.

### Adding Authentication

During project creation:
```bash
awesome-express new my-app --include-auth
```

Or to an existing project:
```bash
awesome-express g auth
```

### Authentication Features

- **Token Generation & Verification**: Complete JWT token lifecycle management
- **Pre-configured Routes**: Ready-to-use login, register, and refresh endpoints
- **Route Protection**: Middleware for securing API endpoints

### Available Endpoints

Once integrated, these endpoints become available:

- `POST /auth/register` - Create a new user
- `POST /auth/login` - Authenticate a user and receive tokens
- `POST /auth/refresh-token` - Refresh an expired access token
- `GET /auth/profile` - Get user profile (protected route)

### Protecting Routes

Use the authentication middleware to protect routes:

```typescript
import { createJwtAuth } from 'awesome-express';

const jwtAuth = createJwtAuth({ 
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

// Protect a single route
router.get('/api/protected', jwtAuth.verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected endpoint',
    user: req.user
  });
});
```

## License

MIT 