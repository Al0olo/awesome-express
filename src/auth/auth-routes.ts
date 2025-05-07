import { Router } from 'express';
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
} 