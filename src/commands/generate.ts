import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import { camelCase, pascalCase, paramCase } from 'change-case';
import ora from 'ora';

/**
 * Generate a controller file
 */
export async function generateController(name: string): Promise<void> {
  // Normalize name
  const normalizedName = name.endsWith('Controller') 
    ? name 
    : `${pascalCase(name)}Controller`;
  
  const fileName = `${paramCase(normalizedName)}.ts`;
  const filePath = path.join(process.cwd(), 'src', 'controllers', fileName);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.error(chalk.red(`Controller ${normalizedName} already exists!`));
    process.exit(1);
  }
  
  // Generate content
  const content = `import { Request, Response } from 'express';

/**
 * ${normalizedName}
 */
export default {
  /**
   * Index action
   */
  index(req: Request, res: Response) {
    res.json({
      message: '${normalizedName} index action'
    });
  },

  /**
   * Show action
   */
  show(req: Request, res: Response) {
    const id = req.params.id;
    res.json({
      message: '${normalizedName} show action',
      id
    });
  },

  /**
   * Create action
   */
  create(req: Request, res: Response) {
    const data = req.body;
    res.status(201).json({
      message: '${normalizedName} create action',
      data
    });
  },

  /**
   * Update action
   */
  update(req: Request, res: Response) {
    const id = req.params.id;
    const data = req.body;
    res.json({
      message: '${normalizedName} update action',
      id,
      data
    });
  },

  /**
   * Delete action
   */
  delete(req: Request, res: Response) {
    const id = req.params.id;
    res.json({
      message: '${normalizedName} delete action',
      id
    });
  }
};
`;

  // Write file
  await fs.writeFile(filePath, content);
  console.log(chalk.green(`Controller ${chalk.bold(normalizedName)} created successfully at ${filePath}`));
  
  // Suggest creating a route
  const routeName = normalizedName.replace('Controller', '');
  console.log(chalk.yellow(`\nTip: Generate a route for this controller:`));
  console.log(chalk.cyan(`  awesome-express generate route ${routeName}`));
}

/**
 * Generate a model file
 */
export async function generateModel(name: string): Promise<void> {
  // Normalize name
  const normalizedName = pascalCase(name);
  const fileName = `${paramCase(normalizedName)}.ts`;
  const filePath = path.join(process.cwd(), 'src', 'models', fileName);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.error(chalk.red(`Model ${normalizedName} already exists!`));
    process.exit(1);
  }
  
  // Generate content
  const content = `/**
 * ${normalizedName} Model
 */
export interface ${normalizedName} {
  id: string | number;
  createdAt: Date;
  updatedAt: Date;
  // Add your model properties here
}

/**
 * A simple in-memory store for ${normalizedName}
 * This is just a placeholder - in a real app, you would use a database
 */
class ${normalizedName}Store {
  private items: Map<string | number, ${normalizedName}> = new Map();

  /**
   * Get all items
   */
  findAll(): ${normalizedName}[] {
    return Array.from(this.items.values());
  }

  /**
   * Find by ID
   */
  findById(id: string | number): ${normalizedName} | undefined {
    return this.items.get(id);
  }

  /**
   * Create a new item
   */
  create(data: Omit<${normalizedName}, 'id' | 'createdAt' | 'updatedAt'>): ${normalizedName} {
    const id = Date.now().toString();
    const now = new Date();
    
    const newItem: ${normalizedName} = {
      id,
      createdAt: now,
      updatedAt: now,
      ...data
    };
    
    this.items.set(id, newItem);
    return newItem;
  }

  /**
   * Update an existing item
   */
  update(id: string | number, data: Partial<${normalizedName}>): ${normalizedName} | undefined {
    const item = this.items.get(id);
    
    if (!item) {
      return undefined;
    }
    
    const updatedItem: ${normalizedName} = {
      ...item,
      ...data,
      updatedAt: new Date()
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  /**
   * Delete an item
   */
  delete(id: string | number): boolean {
    return this.items.delete(id);
  }
}

// Export a singleton instance
export const ${camelCase(normalizedName)}Store = new ${normalizedName}Store();
`;

  // Write file
  await fs.writeFile(filePath, content);
  console.log(chalk.green(`Model ${chalk.bold(normalizedName)} created successfully at ${filePath}`));
}

/**
 * Generate a route file
 */
export async function generateRoute(name: string): Promise<void> {
  // Normalize name
  const baseName = name.endsWith('Routes') 
    ? name.slice(0, -6) 
    : name;
  
  const controllerName = `${pascalCase(baseName)}Controller`;
  const routesName = `${paramCase(baseName)}-routes`;
  const filePath = path.join(process.cwd(), 'src', 'routes', `${routesName}.ts`);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.error(chalk.red(`Route ${routesName} already exists!`));
    process.exit(1);
  }
  
  // Check if controller exists
  const controllerPath = path.join(process.cwd(), 'src', 'controllers', `${paramCase(controllerName)}.ts`);
  const controllerExists = fs.existsSync(controllerPath);
  
  // Generate content
  const content = `import { Router } from 'express';
${controllerExists ? `import ${camelCase(controllerName)} from '../controllers/${paramCase(controllerName)}';` : '// TODO: Import the controller for these routes'}

const router = Router();

// ${pascalCase(baseName)} routes
${controllerExists ? `router.get('/', ${camelCase(controllerName)}.index);
router.get('/:id', ${camelCase(controllerName)}.show);
router.post('/', ${camelCase(controllerName)}.create);
router.put('/:id', ${camelCase(controllerName)}.update);
router.delete('/:id', ${camelCase(controllerName)}.delete);` : 
`// TODO: Add your routes here
// router.get('/', yourController.index);
// router.get('/:id', yourController.show);
// router.post('/', yourController.create);
// router.put('/:id', yourController.update);
// router.delete('/:id', yourController.delete);`}

export default router;
`;

  // Write file
  await fs.writeFile(filePath, content);
  console.log(chalk.green(`Route ${chalk.bold(routesName)} created successfully at ${filePath}`));
  
  // Suggest next steps
  if (!controllerExists) {
    console.log(chalk.yellow(`\nTip: Generate a controller for these routes:`));
    console.log(chalk.cyan(`  awesome-express generate controller ${baseName}`));
  }
  
  console.log(chalk.yellow(`\nTip: Don't forget to register your routes in src/app.ts:`));
  console.log(chalk.cyan(`  import ${camelCase(baseName)}Routes from './routes/${routesName}';`));
  console.log(chalk.cyan(`  app.use('/${paramCase(baseName)}', ${camelCase(baseName)}Routes);`));
}

/**
 * Generates an authentication setup for the project
 */
export async function generateAuth(directory = '.', options: any): Promise<void> {
  const projectPath = path.resolve(process.cwd(), directory);
  
  if (!fs.existsSync(projectPath)) {
    console.error(chalk.red(`Directory ${directory} does not exist!`));
    process.exit(1);
  }
  
  // Check if auth directory already exists
  const authDir = path.join(projectPath, 'src', 'auth');
  if (fs.existsSync(authDir)) {
    console.error(chalk.yellow(`Auth module already exists in ${authDir}`));
    console.log('You can still manually copy files from node_modules/awesome-express/lib/auth');
    process.exit(1);
  }
  
  const spinner = ora('Setting up authentication...').start();
  
  try {
    // Create auth directory
    fs.mkdirSync(authDir, { recursive: true });
    
    // Copy auth files from templates
    const templateDir = path.join(__dirname, '..', '..', 'lib', 'auth');
    
    // Copy auth module
    fs.copyFileSync(
      path.join(templateDir, 'index.js'),
      path.join(authDir, 'index.ts')
    );
    
    // Copy auth controller
    fs.copyFileSync(
      path.join(templateDir, 'auth-controller.js'),
      path.join(authDir, 'auth-controller.ts')
    );
    
    // Copy auth routes
    fs.copyFileSync(
      path.join(templateDir, 'auth-routes.js'),
      path.join(authDir, 'auth-routes.ts')
    );
    
    // Update package.json to add jsonwebtoken dependency if needed
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      let updated = false;
      
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }
      
      if (!packageJson.dependencies.jsonwebtoken) {
        packageJson.dependencies.jsonwebtoken = '^9.0.0';
        updated = true;
      }
      
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      
      if (!packageJson.devDependencies['@types/jsonwebtoken']) {
        packageJson.devDependencies['@types/jsonwebtoken'] = '^9.0.0';
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    }
    
    // Update .env file to add JWT_SECRET if it doesn't exist
    const envPath = path.join(projectPath, '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!envContent.includes('JWT_SECRET')) {
        // Generate a random JWT secret
        const secret = require('crypto').randomBytes(32).toString('hex');
        envContent += `\n# JWT Authentication\nJWT_SECRET=${secret}\n`;
        fs.writeFileSync(envPath, envContent);
      }
    }
    
    spinner.succeed('Authentication setup completed successfully');
    console.log(chalk.green('\nTo integrate with your app, add the following to your app.ts:'));
    console.log(chalk.cyan(`
import { createAuthRoutes } from './auth/auth-routes';

// Add this near other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up auth routes (add your actual secret)
const authRoutes = createAuthRoutes(process.env.JWT_SECRET || 'your-secret-key');
app.use('/auth', authRoutes);
`));
    
    console.log(chalk.green('\nAvailable endpoints:'));
    console.log(chalk.cyan('POST /auth/register - Create a new user'));
    console.log(chalk.cyan('POST /auth/login - Authenticate a user'));
    console.log(chalk.cyan('POST /auth/refresh-token - Refresh an access token'));
    console.log(chalk.cyan('GET /auth/profile - Get user profile (protected)'));
    
  } catch (error) {
    spinner.fail('Failed to set up authentication');
    console.error(error);
    process.exit(1);
  }
} 