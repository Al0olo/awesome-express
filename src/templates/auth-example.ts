/**
 * Example of how to integrate JWT authentication in an awesome-express application
 */

import express from 'express';
import dotenv from 'dotenv';
import { createHttp2App, startHttp2Server } from '../../lib/index'; // In a real app, this would be 'awesome-express'
import { createAuthRoutes } from '../auth/auth-routes';
import { createJwtAuth } from '../auth';

// Load environment variables
dotenv.config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function bootstrap() {
  // Create Express app
  const app = createHttp2App();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Set up JWT authentication
  const authRoutes = createAuthRoutes(JWT_SECRET);
  app.use('/auth', authRoutes);
  
  // Create a JWT auth instance for protecting other routes
  const jwtAuth = createJwtAuth({ secret: JWT_SECRET });
  
  // Example of a protected API route
  app.get('/api/protected', jwtAuth.verifyToken, (req, res) => {
    res.json({
      message: 'This is a protected endpoint',
      user: req.user
    });
  });
  
  // Public route
  app.get('/api/public', (req, res) => {
    res.json({
      message: 'This is a public endpoint'
    });
  });
  
  // Example using Role-based access control
  app.get('/api/admin', jwtAuth.verifyToken, (req, res) => {
    // Check if user has admin role
    if (req.user && req.user.roles && req.user.roles.includes('admin')) {
      return res.json({
        message: 'Admin access granted',
        user: req.user
      });
    }
    
    return res.status(403).json({
      message: 'Access denied: Admin role required'
    });
  });
  
  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
  
  // Start HTTP/2 server (with SSL in production)
  try {
    // For development, you might want to use HTTP
    if (process.env.NODE_ENV !== 'production') {
      const http = require('http');
      const httpServer = http.createServer(app);
      const HTTP_PORT = process.env.HTTP_PORT || 8080;
      
      httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
      });
    }
    
    // Always setup HTTPS/HTTP2 server
    await startHttp2Server(app, {
      cert: process.env.SSL_CERT_PATH || './certs/localhost.crt',
      key: process.env.SSL_KEY_PATH || './certs/localhost.key',
      port: parseInt(process.env.PORT || '3000')
    });
    
    console.log(`HTTPS server running on https://localhost:${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error); 