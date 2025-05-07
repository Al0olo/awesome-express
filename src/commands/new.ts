import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import execa from 'execa';
import * as ejs from 'ejs';

interface NewProjectOptions {
  directory?: string;
  skipInstall?: boolean;
  skipGit?: boolean;
}

/**
 * Creates a new express-http2 application
 */
export async function createNewProject(name: string, options: NewProjectOptions): Promise<void> {
  // Set target directory
  const targetDir = options.directory || name;
  const projectPath = path.resolve(process.cwd(), targetDir);
  
  console.log(chalk.bold(`Creating a new express-http2 app in ${chalk.green(projectPath)}`));
  
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
  
  // Copy template files
  const spinner = ora('Creating project structure...').start();
  try {
    await copyTemplateFiles(projectPath, name);
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
async function copyTemplateFiles(projectPath: string, projectName: string): Promise<void> {
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
      certbot: 'express-http2 certbot'
    },
    dependencies: {
      express: '^4.18.2',
      'express-http2': '^0.1.0',
      'express-validator': '^7.0.1',
      dotenv: '^16.0.3'
    },
    devDependencies: {
      '@types/express': '^4.17.17',
      '@types/node': '^18.16.0',
      nodemon: '^2.0.22',
      'ts-node': '^10.9.1',
      typescript: '^5.0.4'
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
NODE_ENV=development
# SSL Certificate paths (for production)
SSL_CERT_PATH=./certs/fullchain.pem
SSL_KEY_PATH=./certs/privkey.pem
`;
  
  await fs.writeFile(path.join(projectPath, '.env'), envContent);
  
  // Create app.ts
  await fs.writeFile(path.join(projectPath, 'src', 'app.ts'), appTsContent(projectName));
  
  // Create server.ts
  await fs.writeFile(path.join(projectPath, 'src', 'server.ts'), serverTsContent);
  
  // Create an example controller
  await fs.writeFile(
    path.join(projectPath, 'src', 'controllers', 'homeController.ts'),
    homeControllerContent
  );
  
  // Create an example route
  await fs.writeFile(
    path.join(projectPath, 'src', 'routes', 'homeRoutes.ts'),
    homeRoutesContent
  );
  
  // Create README.md
  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent(projectName));
  
  // Create self-signed certificate script for development
  await fs.writeFile(
    path.join(projectPath, 'scripts', 'generate-dev-certs.sh'),
    generateDevCertsScript
  );
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

function appTsContent(projectName: string): string {
  return `import express, { 
  Express, 
  Request, 
  Response, 
  NextFunction 
} from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from 'express-http2';

// Import routes
import homeRoutes from './routes/homeRoutes';

// Initialize environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', homeRoutes);

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
import { createHttp2App, startHttp2Server } from 'express-http2';
import fs from 'fs';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function bootstrap() {
  const app = createHttp2App();
  
  // Import app configuration
  const configuredApp = require('./app').default;
  
  try {
    // In development, we use self-signed certificates
    // In production, we use certbot-generated certificates
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
    
    console.log(\`Server running in \${NODE_ENV} mode on port \${PORT}\`);
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

This project was generated with [express-http2](https://github.com/yourusername/express-http2).

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