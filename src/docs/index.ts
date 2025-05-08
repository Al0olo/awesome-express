/**
 * OpenAPI Documentation module for awesome-express
 * Provides automatic API documentation generation
 */

import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

export interface OpenAPIOptions {
  title?: string;
  version?: string;
  description?: string;
  basePath?: string;
  servers?: Array<{ url: string; description?: string }>;
  securitySchemes?: Record<string, any>;
  outputPath?: string;
}

/**
 * Default OpenAPI options
 */
const defaultOptions: OpenAPIOptions = {
  title: 'API Documentation',
  version: '1.0.0',
  description: 'API documentation generated with awesome-express',
  basePath: '/',
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development HTTP server'
    },
    {
      url: 'https://localhost:3000',
      description: 'Development HTTPS server (HTTP/2)'
    }
  ]
};

/**
 * Setup Swagger documentation for an Express app
 */
export function setupSwagger(app: Express, options: OpenAPIOptions): void {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Define base Swagger definition
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: mergedOptions.title || 'API Documentation',
      version: mergedOptions.version || '1.0.0',
      description: mergedOptions.description || 'API Documentation'
    },
    servers: mergedOptions.servers,
    basePath: mergedOptions.basePath,
    components: {
      securitySchemes: mergedOptions.securitySchemes || {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };
  
  // Find all route files in the project
  const projectRoot = process.cwd();
  const routesPath = path.join(projectRoot, 'src', 'routes');
  const controllersPath = path.join(projectRoot, 'src', 'controllers');
  
  let apis = [];
  
  // Check if the directories exist and add them as sources
  if (fs.existsSync(routesPath)) {
    apis.push(path.join(routesPath, '**/*.ts'));
    apis.push(path.join(routesPath, '**/*.js'));
  }
  
  if (fs.existsSync(controllersPath)) {
    apis.push(path.join(controllersPath, '**/*.ts'));
    apis.push(path.join(controllersPath, '**/*.js'));
  }
  
  // If no API files found, use a default pattern
  if (apis.length === 0) {
    apis = [
      path.join(projectRoot, 'src', '**', '*.ts'),
      path.join(projectRoot, 'src', '**', '*.js'),
      // Exclude test files
      `!${path.join(projectRoot, 'src', '**', '*.test.ts')}`,
      `!${path.join(projectRoot, 'src', '**', '*.test.js')}`
    ];
  }
  
  // Swagger JSDoc configuration
  const swaggerOptions = {
    definition: swaggerDefinition,
    apis
  };
  
  // Initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  // Export OpenAPI specification to a file if requested
  if (mergedOptions.outputPath) {
    const outputPath = path.resolve(projectRoot, mergedOptions.outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`OpenAPI specification saved to ${outputPath}`);
  }
  
  // Setup Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }'
    })
  );
  
  // Route to serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

/**
 * Generates OpenAPI specification without setting up routes
 */
export function generateOpenApiSpec(options: OpenAPIOptions): object {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Define base Swagger definition
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: mergedOptions.title || 'API Documentation',
      version: mergedOptions.version || '1.0.0',
      description: mergedOptions.description || 'API Documentation'
    },
    servers: mergedOptions.servers,
    basePath: mergedOptions.basePath,
    components: {
      securitySchemes: mergedOptions.securitySchemes || {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };
  
  // Find all route files in the project
  const projectRoot = process.cwd();
  const routesPath = path.join(projectRoot, 'src', 'routes');
  const controllersPath = path.join(projectRoot, 'src', 'controllers');
  
  let apis = [];
  
  // Check if the directories exist and add them as sources
  if (fs.existsSync(routesPath)) {
    apis.push(path.join(routesPath, '**/*.ts'));
    apis.push(path.join(routesPath, '**/*.js'));
  }
  
  if (fs.existsSync(controllersPath)) {
    apis.push(path.join(controllersPath, '**/*.ts'));
    apis.push(path.join(controllersPath, '**/*.js'));
  }
  
  // If no API files found, use a default pattern
  if (apis.length === 0) {
    apis = [
      path.join(projectRoot, 'src', '**', '*.ts'),
      path.join(projectRoot, 'src', '**', '*.js'),
      // Exclude test files
      `!${path.join(projectRoot, 'src', '**', '*.test.ts')}`,
      `!${path.join(projectRoot, 'src', '**', '*.test.js')}`
    ];
  }
  
  // Swagger JSDoc configuration
  const swaggerOptions = {
    definition: swaggerDefinition,
    apis
  };
  
  // Initialize swagger-jsdoc
  return swaggerJSDoc(swaggerOptions);
}

export default {
  setupSwagger,
  generateOpenApiSpec
}; 