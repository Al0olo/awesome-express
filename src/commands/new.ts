import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import execa from 'execa';
import * as ejs from 'ejs';
import inquirer from 'inquirer';

interface NewProjectOptions {
  directory?: string;
  skipInstall?: boolean;
  skipGit?: boolean;
  includeAuth?: boolean;
  includeOpenApi?: boolean;
}

/**
 * Creates a new awesome-express application
 */
export async function createNewProject(name: string, options: NewProjectOptions): Promise<void> {
  // Set target directory
  const targetDir = options.directory || name;
  const projectPath = path.resolve(process.cwd(), targetDir);
  
  console.log(chalk.bold(`Creating a new awesome-express app in ${chalk.green(projectPath)}`));
  
  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    const dirEmpty = fs.readdirSync(projectPath).length === 0;
    if (!dirEmpty) {
      console.error(chalk.red(`The directory ${targetDir} already exists and is not empty!`));
      process.exit(1);
    }
  } else {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  
  // Prompt for JWT authentication if not specified
  if (options.includeAuth === undefined) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeAuth',
        message: 'Would you like to include JWT authentication?',
        default: false
      }
    ]);
    options.includeAuth = answer.includeAuth;
  }
  
  // Prompt for OpenAPI documentation if not specified
  if (options.includeOpenApi === undefined) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeOpenApi',
        message: 'Would you like to include OpenAPI documentation?',
        default: false
      }
    ]);
    options.includeOpenApi = answer.includeOpenApi;
  }
  
  // Copy template files
  const spinner = ora('Creating project structure...').start();
  try {
    await copyTemplateFiles(projectPath, name, options.includeAuth, options.includeOpenApi);
    spinner.succeed('Project structure created');
  } catch (error) {
    spinner.fail('Failed to create project structure');
    throw error;
  }
  
  // Initialize git repository
  if (!options.skipGit) {
    const gitSpinner = ora('Initializing git repository...').start();
    try {
      await execa('git', ['init'], { cwd: projectPath });
      await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
      gitSpinner.succeed('Git repository initialized');
    } catch (error) {
      gitSpinner.fail('Failed to initialize git repository');
      console.error(chalk.yellow('Git init failed, continuing...'));
    }
  }
  
  // Install dependencies
  if (!options.skipInstall) {
    const installSpinner = ora('Installing dependencies...').start();
    try {
      await execa('npm', ['install'], { cwd: projectPath });
      installSpinner.succeed('Dependencies installed');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      console.error(chalk.yellow('Dependency installation failed, continuing...'));
    }
  }
  
  // Generate development certificates
  const certSpinner = ora('Generating development SSL certificates...').start();
  try {
    // Make the script executable
    await execa('chmod', ['+x', path.join(projectPath, 'scripts', 'generate-dev-certs.sh')]);
    // Run the certificate generation script
    await execa('bash', ['scripts/generate-dev-certs.sh'], { cwd: projectPath });
    certSpinner.succeed('Development SSL certificates created');
  } catch (error) {
    certSpinner.fail('Failed to generate SSL certificates');
    console.error(chalk.yellow('Certificate generation failed, you can run it manually later.'));
  }
  
  // Show success message
  console.log(chalk.green(`\nSuccess! Created ${name} at ${projectPath}`));
  console.log('Inside that directory, you can run several commands:');
  console.log(chalk.cyan('\n  npm start'));
  console.log('    Starts the development server.');
  console.log(chalk.cyan('\n  npm run dev'));
  console.log('    Starts the development server with hot reloading.');
  console.log(chalk.cyan('\n  npm run certbot'));
  console.log('    Runs the certbot to get SSL certificates for production.');
  console.log(chalk.cyan('\n  npm run build'));
  console.log('    Builds the app for production.');
  
  console.log(chalk.green('\nWe suggest you begin by typing:'));
  console.log(chalk.cyan(`\n  cd ${targetDir}`));
  console.log(chalk.cyan('  npm start'));
  console.log('\nHappy coding!');
}

/**
 * Copy template files to the project directory
 */
async function copyTemplateFiles(
  projectPath: string, 
  projectName: string, 
  includeAuth = false,
  includeOpenApi = false
): Promise<void> {
  // In a real implementation, this would copy from actual template files
  // For now, we'll create the basic structure programmatically
  
  // Create directory structure
  const dirs = [
    'src',
    'src/controllers',
    'src/models',
    'src/routes',
    'src/middleware',
    'src/config',
    'src/public',
    'src/views',
    'certs',
    'scripts'
  ];
  
  for (const dir of dirs) {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  }
  
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      start: 'ts-node src/server.ts',
      dev: 'nodemon --exec ts-node src/server.ts',
      build: 'tsc',
      certbot: 'awesome-express certbot',
      docs: 'awesome-express docs serve'
    },
    dependencies: {
      express: '^4.18.2',
      'awesome-express': '^0.1.0',
      'express-validator': '^7.0.1',
      dotenv: '^16.0.3',
      jsonwebtoken: '^9.0.2',
      ...(includeOpenApi ? {
        'swagger-jsdoc': '^6.2.8',
        'swagger-ui-express': '^5.0.0'
      } : {})
    },
    devDependencies: {
      '@types/express': '^4.17.17',
      '@types/node': '^18.16.0',
      nodemon: '^2.0.22',
      'ts-node': '^10.9.1',
      typescript: '^5.0.4',
      '@types/jsonwebtoken': '^9.0.2',
      ...(includeOpenApi ? {
        '@types/swagger-jsdoc': '^6.0.1',
        '@types/swagger-ui-express': '^4.1.3'
      } : {})
    }
  };
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules']
  };
  
  await fs.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  
  // Create .env file
  const envContent = `PORT=3000
HTTP_PORT=3001
NODE_ENV=development
# SSL Certificate paths (for production)
SSL_CERT_PATH=./certs/fullchain.pem
SSL_KEY_PATH=./certs/privkey.pem
${includeAuth ? `\n# JWT Authentication\nJWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}\n` : ''}`;
  
  await fs.writeFile(path.join(projectPath, '.env'), envContent);
  
  // Create app.ts
  await fs.writeFile(path.join(projectPath, 'src', 'app.ts'), appTsContent(projectName, includeAuth, includeOpenApi));
  
  // Create server.ts
  await fs.writeFile(path.join(projectPath, 'src', 'server.ts'), serverTsContent);
  
  // Create an example controller
  const controllerContent = includeOpenApi ? homeControllerWithSwaggerContent : homeControllerContent;
  await fs.writeFile(
    path.join(projectPath, 'src', 'controllers', 'homeController.ts'),
    controllerContent
  );
  
  // Create an example route
  const routesContent = includeOpenApi ? homeRoutesWithSwaggerContent : homeRoutesContent;
  await fs.writeFile(
    path.join(projectPath, 'src', 'routes', 'homeRoutes.ts'),
    routesContent
  );
  
  // Create README.md
  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent(projectName));
  
  // Create self-signed certificate script for development
  await fs.writeFile(
    path.join(projectPath, 'scripts', 'generate-dev-certs.sh'),
    generateDevCertsScript
  );
  
  // If authentication is requested, set up auth files
  if (includeAuth) {
    // Create auth directory
    fs.mkdirSync(path.join(projectPath, 'src', 'auth'), { recursive: true });
    
    // Create auth files from templates
    // In a real implementation, we would copy from template files
    // For now, we'll create placeholder files with basic structure
    
    await fs.writeFile(
      path.join(projectPath, 'src', 'auth', 'index.ts'),
      authIndexContent
    );
    
    await fs.writeFile(
      path.join(projectPath, 'src', 'auth', 'auth-controller.ts'),
      authControllerContent
    );
    
    await fs.writeFile(
      path.join(projectPath, 'src', 'auth', 'auth-routes.ts'),
      authRoutesContent
    );
  }
  
  // If OpenAPI is requested, set up swagger documentation
  if (includeOpenApi) {
    // Create docs directory for OpenAPI types and components
    fs.mkdirSync(path.join(projectPath, 'src', 'docs'), { recursive: true });
    
    await fs.writeFile(
      path.join(projectPath, 'src', 'docs', 'swagger.ts'),
      swaggerConfigContent(projectName)
    );
  }
}

const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# SSL certificates
certs/*.pem
certs/*.key
# Keep the directory structure
!certs/.gitkeep

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
`;

function appTsContent(projectName: string, includeAuth = false, includeOpenApi = false): string {
  return `import express, { 
  Express, 
  Request, 
  Response, 
  NextFunction 
} from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from 'awesome-express';

// Import routes
import homeRoutes from './routes/homeRoutes';
${includeAuth ? "import { createAuthRoutes } from './auth/auth-routes';\n" : ''}
${includeOpenApi ? "import { setupSwagger } from './docs/swagger';\n" : ''}

// Initialize environment variables
dotenv.config();

${includeAuth ? "// JWT Secret\nconst JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';\n" : ''}
// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', homeRoutes);
${includeOpenApi ? "\n// Setup OpenAPI documentation\nsetupSwagger(app);\n" : ''}

${includeAuth ? "\n// Authentication routes\nconst authRoutes = createAuthRoutes(JWT_SECRET);\napp.use('/auth', authRoutes);\n" : ''}


// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use(errorHandler);

export default app;
`;
}

const serverTsContent = `import path from 'path';
import dotenv from 'dotenv';
import { createHttp2App, startHttp2Server } from 'awesome-express';
import fs from 'fs';
import express from 'express';
import http from 'http';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function bootstrap() {
  const app = createHttp2App();
  
  // Import app configuration
  const configuredApp = require('./app').default;
  
  try {
    // In development, we support both HTTP and HTTPS
    // In production, we use HTTPS only with certbot-generated certificates
    if (NODE_ENV === 'development') {
      // Start HTTP server for development convenience
      const httpServer = http.createServer(configuredApp);
      httpServer.listen(HTTP_PORT, () => {
        console.log(\`HTTP server running in \${NODE_ENV} mode on http://localhost:\${HTTP_PORT}\`);
      });
    }
    
    // Setup HTTPS with HTTP/2
    let certPath, keyPath;
    
    if (NODE_ENV === 'production') {
      certPath = process.env.SSL_CERT_PATH || './certs/fullchain.pem';
      keyPath = process.env.SSL_KEY_PATH || './certs/privkey.pem';
    } else {
      // For development, use self-signed certificates
      certPath = path.join(__dirname, '../certs/localhost.crt');
      keyPath = path.join(__dirname, '../certs/localhost.key');
      
      // Check if dev certificates exist, if not, guide the user
      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error('Development SSL certificates not found!');
        console.error('Please run: bash scripts/generate-dev-certs.sh');
        process.exit(1);
      }
    }
    
    await startHttp2Server(configuredApp, {
      cert: certPath,
      key: keyPath,
      port: PORT
    });
    
    console.log(\`HTTPS server running in \${NODE_ENV} mode on https://localhost:\${PORT} (HTTP/2)\`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
`;

const homeControllerContent = `import { Request, Response } from 'express';

/**
 * Home controller
 */
export default {
  /**
   * Index action - renders the homepage
   */
  index(req: Request, res: Response) {
    res.json({
      message: 'Welcome to Express HTTP/2!',
      http2: true,
      timestamp: new Date().toISOString()
    });
  }
};
`;

const homeRoutesContent = `import { Router } from 'express';
import homeController from '../controllers/homeController';

const router = Router();

// Home routes
router.get('/', homeController.index);

export default router;
`;

function readmeContent(projectName: string): string {
  return `# ${projectName}

This project was generated with [awesome-express](https://github.com/al0olo/awesome-express).

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn
\`\`\`

Generate development SSL certificates:

\`\`\`bash
bash scripts/generate-dev-certs.sh
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Your HTTP/2 server will be running at \`https://localhost:3000\`.

## Production

For production, you should obtain proper SSL certificates. You can use Let's Encrypt with certbot:

\`\`\`bash
npm run certbot
\`\`\`

Then build and start your application:

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
.
├── certs/                # SSL certificates
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
\`\`\`

## Commands

- \`npm start\`: Start the production server
- \`npm run dev\`: Start the development server with hot reloading
- \`npm run build\`: Build the application for production
- \`npm run certbot\`: Run certbot to obtain SSL certificates
`;
}

const generateDevCertsScript = `#!/bin/bash
set -e

CERT_DIR="./certs"
mkdir -p $CERT_DIR

echo "Generating self-signed SSL certificates for development..."

openssl req -x509 -out $CERT_DIR/localhost.crt -keyout $CERT_DIR/localhost.key \\
  -newkey rsa:2048 -nodes -sha256 \\
  -subj '/CN=localhost' -extensions EXT -config <( \\
   printf "[dn]\\nCN=localhost\\n[req]\\ndistinguished_name = dn\\n[EXT]\\nsubjectAltName=DNS:localhost\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")

echo "Development certificates generated successfully at:"
echo "  - $CERT_DIR/localhost.crt"
echo "  - $CERT_DIR/localhost.key"
echo "These are self-signed certificates and should only be used for development."
`;

const authIndexContent = `/**
 * Authentication module
 * Provides JWT authentication functionality
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  [key: string]: any;
}

export interface JwtOptions {
  secret: string;
  expiresIn?: string | number;
  refreshExpiresIn?: string | number;
  issuer?: string;
  audience?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Creates JWT authentication middleware
 */
export function createJwtAuth(options: JwtOptions) {
  return {
    /**
     * Generates a JWT token
     */
    generateToken(payload: JwtPayload, isRefresh = false): string {
      const tokenOptions: jwt.SignOptions = {
        expiresIn: isRefresh ? options.refreshExpiresIn || '7d' : options.expiresIn || '1h' as any,
      };
      
      if (options.issuer) {
        tokenOptions.issuer = options.issuer;
      }
      
      if (options.audience) {
        tokenOptions.audience = options.audience;
      }
      
      return jwt.sign(payload, options.secret, tokenOptions);
    },
    
    /**
     * Issues both access and refresh tokens
     */
    issueTokens(payload: JwtPayload): TokenResponse {
      const accessToken = this.generateToken(payload);
      const refreshToken = this.generateToken(payload, true);
      
      // Parse the expiration from the token
      const decoded = jwt.decode(accessToken) as { exp: number };
      const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
      
      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    },
    
    /**
     * Middleware to verify JWT tokens
     */
    verifyToken(req: Request, res: Response, next: NextFunction): Response | void {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      try {
        const decoded = jwt.verify(token, options.secret) as JwtPayload;
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: 'Token expired' });
        }
        
        return res.status(401).json({ message: 'Invalid token' });
      }
    },
    
    /**
     * Middleware to refresh an expired token
     */
    refreshToken(req: Request, res: Response): Response {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      
      try {
        const decoded = jwt.verify(refreshToken, options.secret) as JwtPayload;
        
        // Issue new tokens
        const tokens = this.issueTokens({
          ...decoded
        });
        
        return res.json(tokens);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
    }
  };
}

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Export a route decorator for TypeScript projects
export function RequireAuth() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(req: Request, res: Response, next: NextFunction) {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      return originalMethod.apply(this, [req, res, next]);
    };
    
    return descriptor;
  };
}`;

const authControllerContent = `import { Request, Response } from 'express';
import { createJwtAuth, JwtPayload } from './index';

// This would typically come from configuration
const jwtAuth = createJwtAuth({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '1h',
  refreshExpiresIn: '7d',
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Authentication Controller
 * 
 * This is a sample controller to demonstrate how to use JWT authentication.
 * In a real implementation, you would connect this to your user database.
 */
export const AuthController = {
  /**
   * Login endpoint
   */
  async login(req: Request, res: Response) {
    const { username, password } = req.body as LoginRequest;
    
    // In a real app, you would validate against a database
    // This is just a simple example
    if (username === 'admin' && password === 'password') {
      // Create payload with user information
      const payload: JwtPayload = {
        sub: '1', // User ID would come from your database
        username,
        roles: ['user']
      };
      
      // Generate tokens
      const tokens = jwtAuth.issueTokens(payload);
      
      return res.json(tokens);
    }
    
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  },
  
  /**
   * Registration endpoint
   */
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body as RegisterRequest;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }
    
    // In a real app, you would validate and store in a database
    // For this example, we'll just pretend it worked
    
    // Create payload
    const payload: JwtPayload = {
      sub: Math.floor(Math.random() * 1000).toString(), // Simulate user ID
      username,
      email,
      roles: ['user']
    };
    
    // Generate tokens
    const tokens = jwtAuth.issueTokens(payload);
    
    return res.status(201).json({
      message: 'User registered successfully',
      ...tokens
    });
  },
  
  /**
   * Token refresh endpoint
   */
  refreshToken(req: Request, res: Response) {
    return jwtAuth.refreshToken(req, res);
  },
  
  /**
   * User profile endpoint (protected)
   */
  getProfile(req: Request, res: Response) {
    // req.user is populated by the JWT middleware
    return res.json({
      profile: req.user
    });
  }
};`;

const authRoutesContent = `import { Router } from 'express';
import { AuthController } from './auth-controller';
import { createJwtAuth } from './index';

/**
 * Creates authentication routes with JWT middleware
 */
export function createAuthRoutes(jwtSecret: string) {
  const router = Router();
  const jwtAuth = createJwtAuth({ secret: jwtSecret });
  
  // Public routes
  router.post('/login', AuthController.login);
  router.post('/register', AuthController.register);
  router.post('/refresh-token', AuthController.refreshToken);
  
  // Protected routes
  router.get('/profile', jwtAuth.verifyToken, AuthController.getProfile);
  
  return router;
}`;

// Add new constants for Swagger-annotated example files

const homeRoutesWithSwaggerContent = `import { Router } from 'express';
import homeController from '../controllers/homeController';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get homepage information
 *     description: Returns welcome message and HTTP/2 status
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to Express HTTP/2!
 *                 http2:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', homeController.index);

export default router;
`;

const homeControllerWithSwaggerContent = `import { Request, Response } from 'express';

/**
 * Home controller
 */
export default {
  /**
   * Index action - renders the homepage
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Response} JSON response
   */
  index(req: Request, res: Response) {
    return res.json({
      message: 'Welcome to Express HTTP/2!',
      http2: true,
      timestamp: new Date().toISOString()
    });
  }
};
`;

const swaggerConfigContent = (projectName: string) => `import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

/**
 * OpenAPI Configuration
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '${projectName} API',
    version: '1.0.0',
    description: 'API Documentation for ${projectName}',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      url: 'https://yourwebsite.com/support',
      email: 'support@yourwebsite.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development HTTP server',
    },
    {
      url: 'https://localhost:3000',
      description: 'Development HTTPS server (HTTP/2)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

/**
 * Options for the swagger specification
 */
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),
    path.join(__dirname, '../controllers/**/*.ts'),
    path.join(__dirname, '../models/**/*.ts'),
  ],
};

/**
 * Initialize swagger-jsdoc
 */
const swaggerSpec = swaggerJSDoc(options);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express): void {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // Route to get OpenAPI specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('OpenAPI documentation available at /api-docs');
}
`; 