import * as inquirer from 'inquirer';
import chalk from 'chalk';
import execa from 'execa';
import ora from 'ora';

interface CertbotOptions {
  domain?: string;
  email?: string;
}

/**
 * Setup SSL certificates using certbot
 */
export async function setupCertbot(options: CertbotOptions): Promise<void> {
  // Check if certbot is installed
  try {
    await execa('certbot', ['--version']);
  } catch (error) {
    console.error(chalk.red('Certbot is not installed!'));
    console.log(chalk.yellow('Please install certbot first:'));
    console.log(chalk.cyan('  Ubuntu/Debian: sudo apt-get install certbot'));
    console.log(chalk.cyan('  CentOS/RHEL: sudo yum install certbot'));
    console.log(chalk.cyan('  macOS: brew install certbot'));
    process.exit(1);
  }
  
  // Prompt for domain and email if not provided
  const answers = await promptMissingOptions(options);
  const domain = answers.domain;
  const email = answers.email;
  
  console.log(chalk.bold('\nGenerating SSL certificates with Let\'s Encrypt for:'));
  console.log(chalk.green(`Domain: ${domain}`));
  console.log(chalk.green(`Email: ${email}`));
  
  // Run certbot with the certonly command
  const spinner = ora('Running certbot...').start();
  try {
    await execa('sudo', [
      'certbot',
      'certonly',
      '--standalone',
      '--preferred-challenges', 'http',
      '--agree-tos',
      '-n',
      '-d', domain,
      '-m', email
    ], { stdio: 'pipe' });
    
    spinner.succeed('SSL certificates generated successfully!');
    
    // Show certificate paths
    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
    const keyPath = `/etc/letsencrypt/live/${domain}/privkey.pem`;
    
    console.log(chalk.bold('\nCertificate paths:'));
    console.log(chalk.cyan(`Certificate: ${certPath}`));
    console.log(chalk.cyan(`Private key: ${keyPath}`));
    
    // Provide instructions for using the certificates
    console.log(chalk.bold('\nUpdate your .env file with these paths:'));
    console.log(chalk.yellow('SSL_CERT_PATH=/etc/letsencrypt/live/' + domain + '/fullchain.pem'));
    console.log(chalk.yellow('SSL_KEY_PATH=/etc/letsencrypt/live/' + domain + '/privkey.pem'));
    
    console.log(chalk.bold('\nCertbot sets up auto-renewal by default.'));
    console.log('You can verify the renewal timer with:');
    console.log(chalk.cyan('  sudo systemctl list-timers'));
    
  } catch (error) {
    spinner.fail('Failed to generate SSL certificates!');
    console.error(chalk.red('Error details:'), error);
    console.log(chalk.yellow('\nTroubleshooting tips:'));
    console.log('1. Make sure port 80 is free and not used by another web server');
    console.log('2. Make sure you have root/sudo privileges');
    console.log('3. Make sure the domain points to this server\'s IP');
    console.log('4. Try running the command manually for more details:');
    console.log(chalk.cyan(`  sudo certbot certonly --standalone -d ${domain} -m ${email}`));
    process.exit(1);
  }
}

/**
 * Prompt for any missing options
 */
async function promptMissingOptions(options: CertbotOptions): Promise<Required<CertbotOptions>> {
  const questions = [];
  
  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'What is your domain name?',
      validate: (input: string) => {
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
        if (domainRegex.test(input)) {
          return true;
        }
        return 'Please enter a valid domain name (e.g. example.com)';
      }
    });
  }
  
  if (!options.email) {
    questions.push({
      type: 'input',
      name: 'email',
      message: 'What is your email address? (for Let\'s Encrypt notifications)',
      validate: (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(input)) {
          return true;
        }
        return 'Please enter a valid email address';
      }
    });
  }
  
  const answers = await inquirer.prompt(questions);
  
  return {
    domain: options.domain || answers.domain,
    email: options.email || answers.email
  };
} 