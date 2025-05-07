import { Command } from 'commander';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import { createNewProject } from './commands/new';
import { generateController, generateModel, generateRoute, generateAuth } from './commands/generate';
import { setupCertbot } from './commands/certbot';
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
      await generateAuth(options.directory, options);
    } catch (error) {
      console.error(chalk.red('Error setting up authentication: '), error);
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

// Help output
program.on('--help', () => {
  console.log('');
  console.log(chalk.green('Examples:'));
  console.log('  $ awesome-express new my-app');
  console.log('  $ awesome-express g controller UserController');
  console.log('  $ awesome-express g auth');
  console.log('  $ awesome-express certbot -d example.com -e admin@example.com');
});

// Parse arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 