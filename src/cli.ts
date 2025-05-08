import { Command } from 'commander';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import { createNewProject } from './commands/new';
import { generateController, generateModel, generateRoute, generateAuth, generateOpenApi } from './commands/generate';
import { setupCertbot } from './commands/certbot';
import { serveDocs, generateDocs } from './commands/docs';
import { version } from '../package.json';

const program = new Command();

// Set version from package.json
program.version(version, '-v, --version', 'Output the current version');
program.name('awesome-express');

// New project command
program
  .command('new <n>')
  .description('Create a new awesome-express application')
  .option('-d, --directory <directory>', 'Specify the directory to create the app in')
  .option('--skip-install', 'Skip installation of dependencies', false)
  .option('--skip-git', 'Skip git initialization', false)
  .option('--include-auth', 'Include JWT authentication setup', false)
  .option('--include-openapi', 'Include OpenAPI documentation', false)
  .action(async (name, options) => {
    try {
      await createNewProject(name, options);
    } catch (error) {
      console.error(chalk.red('Error creating project: '), error);
      process.exit(1);
    }
  });

// Generate commands
const generate = program.command('generate').alias('g').description('Generate application components');

generate
  .command('controller <name>')
  .description('Generate a new controller')
  .action(async (name) => {
    try {
      await generateController(name);
    } catch (error) {
      console.error(chalk.red('Error generating controller: '), error);
      process.exit(1);
    }
  });

generate
  .command('model <name>')
  .description('Generate a new model')
  .action(async (name) => {
    try {
      await generateModel(name);
    } catch (error) {
      console.error(chalk.red('Error generating model: '), error);
      process.exit(1);
    }
  });

generate
  .command('route <name>')
  .description('Generate a new route')
  .action(async (name) => {
    try {
      await generateRoute(name);
    } catch (error) {
      console.error(chalk.red('Error generating route: '), error);
      process.exit(1);
    }
  });

generate
  .command('auth')
  .description('Generate JWT authentication setup')
  .option('-d, --directory <directory>', 'Target directory (default: current directory)')
  .action(async (options) => {
    try {
      await generateAuth(options.directory, {});
    } catch (error) {
      console.error(chalk.red('Error setting up authentication: '), error);
      process.exit(1);
    }
  });

generate
  .command('openapi')
  .alias('swagger')
  .description('Generate OpenAPI documentation setup')
  .option('-d, --directory <directory>', 'Target directory (default: current directory)')
  .action(async (options) => {
    try {
      await generateOpenApi(options.directory, {});
    } catch (error) {
      console.error(chalk.red('Error setting up OpenAPI documentation: '), error);
      process.exit(1);
    }
  });

// Certbot command
program
  .command('certbot')
  .description('Setup SSL certificates using certbot')
  .option('-d, --domain <domain>', 'Domain name')
  .option('-e, --email <email>', 'Email address')
  .action(async (options) => {
    try {
      await setupCertbot(options);
    } catch (error) {
      console.error(chalk.red('Error setting up certbot: '), error);
      process.exit(1);
    }
  });

// Add documentation commands
const docs = program.command('docs').description('API documentation utilities');

docs
  .command('serve')
  .description('Serve API documentation with Swagger UI')
  .option('-p, --port <port>', 'Port to run the documentation server (default: 8080)')
  .option('-o, --output <path>', 'Save OpenAPI specification to a file')
  .option('-t, --title <title>', 'API title')
  .option('-v, --version <version>', 'API version')
  .action(async (options) => {
    try {
      await serveDocs(options);
    } catch (error) {
      console.error(chalk.red('Error serving documentation: '), error);
      process.exit(1);
    }
  });

docs
  .command('generate <output>')
  .description('Generate OpenAPI specification to a file')
  .option('-t, --title <title>', 'API title')
  .option('-v, --version <version>', 'API version')
  .action(async (output, options) => {
    try {
      await generateDocs(output, options);
    } catch (error) {
      console.error(chalk.red('Error generating documentation: '), error);
      process.exit(1);
    }
  });

// Help output
program.on('--help', () => {
  console.log('');
  console.log(chalk.green('Examples:'));
  console.log('  $ awesome-express new my-app');
  console.log('  $ awesome-express g controller UserController');
  console.log('  $ awesome-express g auth');
  console.log('  $ awesome-express docs serve');
  console.log('  $ awesome-express certbot -d example.com -e admin@example.com');
});

// Parse arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 