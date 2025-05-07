/**
 * Authentication module for awesome-express
 * Provides JWT authentication functionality
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  [key: string]: any;
}

export interface JwtOptions {
  secret: string;
  expiresIn?: string | number;
  refreshExpiresIn?: string | number;
  issuer?: string;
  audience?: string;
}

export interface AuthConfig {
  jwt: JwtOptions;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Creates JWT authentication middleware
 */
export function createJwtAuth(options: JwtOptions) {
  return {
    /**
     * Generates a JWT token
     */
    generateToken(payload: JwtPayload, isRefresh = false): string {
      const tokenOptions: jwt.SignOptions = {
        expiresIn: isRefresh ? options.refreshExpiresIn || '7d' : options.expiresIn || '1h' as any,
      };
      
      if (options.issuer) {
        tokenOptions.issuer = options.issuer;
      }
      
      if (options.audience) {
        tokenOptions.audience = options.audience;
      }
      
      return jwt.sign(payload, options.secret, tokenOptions);
    },
    
    /**
     * Issues both access and refresh tokens
     */
    issueTokens(payload: JwtPayload): TokenResponse {
      const accessToken = this.generateToken(payload);
      const refreshToken = this.generateToken(payload, true);
      
      // Parse the expiration from the token
      const decoded = jwt.decode(accessToken) as { exp: number };
      const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
      
      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    },
    
    /**
     * Middleware to verify JWT tokens
     */
    verifyToken(req: Request, res: Response, next: NextFunction): Response | void {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
      }
      
      try {
        const decoded = jwt.verify(token, options.secret) as JwtPayload;
        req.user = decoded;
        next();
      } catch (error) {
        // Check for token expiration by checking the error name rather than using instanceof
        if (error instanceof Error && error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        
        return res.status(401).json({ message: 'Invalid token' });
      }
    },
    
    /**
     * Middleware to refresh an expired token
     */
    refreshToken(req: Request, res: Response): Response {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      
      try {
        const decoded = jwt.verify(refreshToken, options.secret) as JwtPayload;
        
        // You might want to check if the refresh token is blacklisted here
        
        // Issue new tokens
        const tokens = this.issueTokens({
          ...decoded
        });
        
        return res.json(tokens);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
    }
  };
}

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Export a route decorator for TypeScript projects
export function RequireAuth() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(req: Request, res: Response, next: NextFunction) {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      return originalMethod.apply(this, [req, res, next]);
    };
    
    return descriptor;
  };
} 