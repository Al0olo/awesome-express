# Security Policy

## Supported Versions

We currently provide security updates for the following versions of awesome-express:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

The awesome-express team takes security issues seriously. We appreciate your efforts to responsibly disclose your findings.

To report a security vulnerability, please email [abdallah.farag@lavaloon.com](mailto:abdallah.farag@lavaloon.com) with the subject line "awesome-express Security Vulnerability". 

Please include the following information in your report:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

We will acknowledge receipt of your vulnerability report within 48 hours and send you regular updates about our progress.

## Disclosure Policy

When we receive a security bug report, we will:
1. Confirm the vulnerability and determine its impact
2. Find an appropriate solution and develop a fix
3. Release a new patch version for all supported versions
4. Publicly disclose the issue after the fix has been widely deployed

## Security Best Practices for awesome-express Users

When using awesome-express in your application, please follow these best practices:

### Environment Variables
- Never hardcode sensitive information like API keys, passwords, or JWT secrets
- Use environment variables (.env) for all sensitive configuration
- Keep .env files out of source control

### Authentication
- Always use HTTPS in production
- Set appropriate token expiration times for JWT tokens
- Implement proper token refresh mechanisms
- Store JWT secrets securely

### HTTP/2 Security
- Keep SSL certificates up to date
- Configure strong SSL/TLS protocols and ciphers
- Use HTTP Strict Transport Security (HSTS)
- Consider implementing Content Security Policy (CSP) headers

### API Security
- Validate all input data
- Implement rate limiting to prevent abuse
- Use CORS with appropriate restrictions
- Follow the principle of least privilege for API routes and handlers

### Dependency Management
- Regularly update dependencies to keep them free of known vulnerabilities
- Consider using tools like `npm audit`, Snyk, or Dependabot to monitor dependencies
- Pin dependency versions for production deployments

## Security Updates

Security updates will be released as patch versions. We recommend implementing automated dependency updates to ensure your application is using the most secure version of awesome-express. 