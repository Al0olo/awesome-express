import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import express from 'express';
import { generateOpenApiSpec } from '../docs';
import swaggerUi from 'swagger-ui-express';

interface DocsOptions {
  port?: number;
  output?: string;
  title?: string;
  version?: string;
}

/**
 * Serve API documentation using Swagger UI
 */
export async function serveDocs(options: DocsOptions = {}): Promise<void> {
  const port = options.port || 8080;
  const projectRoot = process.cwd();
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  let title = options.title || 'API Documentation';
  let version = options.version || '1.0.0';
  
  // Try to get project info from package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      title = options.title || packageJson.name || title;
      version = options.version || packageJson.version || version;
    } catch (error) {
      console.warn(chalk.yellow('Failed to parse package.json, using default title and version'));
    }
  }
  
  const spinner = ora('Generating API documentation...').start();
  
  try {
    // Generate OpenAPI specification
    const swaggerSpec = generateOpenApiSpec({
      title,
      version,
      description: `API documentation for ${title}`,
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Documentation server'
        }
      ]
    });
    
    // Export to file if requested
    if (options.output) {
      const outputPath = path.resolve(projectRoot, options.output);
      fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
      spinner.succeed(`OpenAPI specification saved to ${outputPath}`);
    } else {
      spinner.succeed('API documentation generated');
    }
    
    // Create a simple Express app to serve the docs
    const app = express();
    
    // Route to serve OpenAPI spec as JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    // Setup Swagger UI
    app.use(
      '/',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }'
      })
    );
    
    // Start the server
    app.listen(port, () => {
      console.log(chalk.green(`\nAPI documentation is running at ${chalk.bold(`http://localhost:${port}`)}`));
      console.log('\nPress Ctrl+C to stop the server');
    });
  } catch (error) {
    spinner.fail('Failed to generate API documentation');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Generate OpenAPI specification to a file
 */
export async function generateDocs(output: string, options: DocsOptions = {}): Promise<void> {
  const projectRoot = process.cwd();
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  let title = options.title || 'API Documentation';
  let version = options.version || '1.0.0';
  
  // Try to get project info from package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      title = options.title || packageJson.name || title;
      version = options.version || packageJson.version || version;
    } catch (error) {
      console.warn(chalk.yellow('Failed to parse package.json, using default title and version'));
    }
  }
  
  const spinner = ora('Generating API documentation...').start();
  
  try {
    // Generate OpenAPI specification
    const swaggerSpec = generateOpenApiSpec({
      title,
      version,
      description: `API documentation for ${title}`
    });
    
    // Export to file
    const outputPath = path.resolve(projectRoot, output);
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    spinner.succeed(`OpenAPI specification saved to ${outputPath}`);
  } catch (error) {
    spinner.fail('Failed to generate API documentation');
    console.error(error);
    process.exit(1);
  }
} 