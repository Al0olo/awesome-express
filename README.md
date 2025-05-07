# express-http2

[![npm version](https://img.shields.io/npm/v/express-http2.svg)](https://www.npmjs.com/package/express-http2)
[![License](https://img.shields.io/npm/l/express-http2.svg)](https://github.com/yourusername/express-http2/blob/main/LICENSE)

An enhanced Express framework with HTTP/2 support and CLI tools for rapid application development.

## Features

- **HTTP/2 Support**: Built-in HTTP/2 server configuration for Express
- **CLI Tool**: Quickly generate new projects and components
- **MVC Pattern**: Organized project structure with models, views, and controllers
- **SSL Certificate Management**: Automatic setup with certbot
- **TypeScript Support**: First-class TypeScript support out of the box

## Installation

```bash
npm install -g express-http2
```

## Quick Start

Create a new project:

```bash
express-http2 new my-app
cd my-app
```

Generate development SSL certificates:

```bash
bash scripts/generate-dev-certs.sh
```

Run the development server:

```bash
npm run dev
```

Your HTTP/2 server will be running at `https://localhost:3000`.

## CLI Commands

### Creating a New Project

```bash
express-http2 new <app-name>
```

Options:
- `-d, --directory <directory>`: Specify a custom directory
- `--skip-install`: Skip installing dependencies
- `--skip-git`: Skip git initialization

### Generating Components

Generate a controller:

```bash
express-http2 generate controller UserController
# or using the alias
express-http2 g controller UserController
```

Generate a model:

```bash
express-http2 g model User
```

Generate a route:

```bash
express-http2 g route User
```

### Setting up SSL Certificates

```bash
express-http2 certbot
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
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

## HTTP/2 API

The framework provides a simple API for setting up HTTP/2 servers with Express:

```typescript
import { createHttp2App, startHttp2Server } from 'express-http2';

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