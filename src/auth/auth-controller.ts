import { Request, Response } from 'express';
import { createJwtAuth, JwtPayload } from './index';

// This would typically come from configuration
const jwtAuth = createJwtAuth({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '1h',
  refreshExpiresIn: '7d',
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Authentication Controller
 * 
 * This is a sample controller to demonstrate how to use JWT authentication.
 * In a real implementation, you would connect this to your user database.
 */
export const AuthController = {
  /**
   * Login endpoint
   */
  async login(req: Request, res: Response) {
    const { username, password } = req.body as LoginRequest;
    
    // In a real app, you would validate against a database
    // This is just a simple example
    if (username === 'admin' && password === 'password') {
      // Create payload with user information
      const payload: JwtPayload = {
        sub: '1', // User ID would come from your database
        username,
        roles: ['user']
      };
      
      // Generate tokens
      const tokens = jwtAuth.issueTokens(payload);
      
      return res.json(tokens);
    }
    
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  },
  
  /**
   * Registration endpoint
   */
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body as RegisterRequest;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }
    
    // In a real app, you would validate and store in a database
    // For this example, we'll just pretend it worked
    
    // Create payload
    const payload: JwtPayload = {
      sub: Math.floor(Math.random() * 1000).toString(), // Simulate user ID
      username,
      email,
      roles: ['user']
    };
    
    // Generate tokens
    const tokens = jwtAuth.issueTokens(payload);
    
    return res.status(201).json({
      message: 'User registered successfully',
      ...tokens
    });
  },
  
  /**
   * Token refresh endpoint
   */
  refreshToken(req: Request, res: Response) {
    return jwtAuth.refreshToken(req, res);
  },
  
  /**
   * User profile endpoint (protected)
   */
  getProfile(req: Request, res: Response) {
    // req.user is populated by the JWT middleware
    return res.json({
      profile: req.user
    });
  }
}; 