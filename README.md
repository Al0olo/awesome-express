# awesome-express

[![npm version](https://img.shields.io/npm/v/awesome-express.svg)](https://www.npmjs.com/package/awesome-express)
[![License](https://img.shields.io/npm/l/awesome-express.svg)](https://github.com/al0olo/awesome-express/blob/main/LICENSE)

An enhanced Express framework with HTTP/2 support and CLI tools for rapid application development.

## Features

- **HTTP/2 Support**: Built-in HTTP/2 server configuration for Express
- **Dual HTTP/HTTPS**: HTTP for easier local development, HTTPS with HTTP/2 for production
- **CLI Tool**: Quickly generate new projects and components
- **MVC Pattern**: Organized project structure with models, views, and controllers
- **SSL Certificate Management**: Automatic setup with certbot
- **TypeScript Support**: First-class TypeScript support out of the box

## Installation

```bash
npm install -g awesome-express
```

## Quick Start

Create a new project:

```bash
awesome-express new my-app
cd my-app
```

The project is ready to use with both HTTP and HTTPS:

```bash
npm run dev
```

Access your server at:
- HTTP: `http://localhost:3001` (for easy local development)
- HTTPS: `https://localhost:3000` (HTTP/2 enabled)

Development SSL certificates are automatically generated during project creation.

## CLI Commands

### Creating a New Project

```bash
awesome-express new <app-name>
```

Options:
- `-d, --directory <directory>`: Specify a custom directory
- `--skip-install`: Skip installing dependencies
- `--skip-git`: Skip git initialization

### Generating Components

Generate a controller:

```bash
awesome-express generate controller UserController
# or using the alias
awesome-express g controller UserController
```

Generate a model:

```bash
awesome-express g model User
```

Generate a route:

```bash
awesome-express g route User
```

### Setting up SSL Certificates

```bash
awesome-express certbot
```

Options:
- `-d, --domain <domain>`: Domain name
- `-e, --email <email>`: Email address (for Let's Encrypt notifications)

## Project Structure

When you create a new project, it follows this structure:

```
.
├── certs/                # SSL certificates
├── scripts/              # Utility scripts
├── src/                  # Source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── public/           # Static files
│   ├── routes/           # Routes definitions
│   ├── views/            # View templates
│   ├── app.ts            # Express app setup
│   └── server.ts         # HTTP/2 server entry point
├── .env                  # Environment variables (configures HTTP_PORT and PORT)
├── package.json
└── tsconfig.json
```

## Configuration

By default, servers run on the following ports:
- Development HTTP server: Port 3001 (configurable via `HTTP_PORT` in .env)
- HTTP/2 HTTPS server: Port 3000 (configurable via `PORT` in .env)

## HTTP/2 API

The framework provides a simple API for setting up HTTP/2 servers with Express:

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

## License

MIT 