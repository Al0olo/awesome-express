import * as path from 'path';
import * as fs from 'fs-extra';
import { Request, Response, NextFunction } from 'express';
import { createJwtAuth, JwtPayload } from '../auth';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(),
  decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 }))
}));

describe('JWT Authentication', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  
  beforeEach(() => {
    req = {
      headers: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn().mockReturnThis() as unknown as Response['json']
    };
    
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createJwtAuth', () => {
    it('should create JWT auth object with methods', () => {
      const jwtAuth = createJwtAuth({ secret: 'test-secret' });
      
      expect(jwtAuth).toHaveProperty('generateToken');
      expect(jwtAuth).toHaveProperty('issueTokens');
      expect(jwtAuth).toHaveProperty('verifyToken');
      expect(jwtAuth).toHaveProperty('refreshToken');
    });
    
    describe('generateToken', () => {
      it('should generate a JWT token', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        const payload: JwtPayload = { sub: '123' };
        
        const token = jwtAuth.generateToken(payload);
        
        expect(token).toBe('mock-token');
        expect(jwt.sign).toHaveBeenCalledWith(
          payload,
          'test-secret',
          expect.objectContaining({ expiresIn: expect.any(String) })
        );
      });
      
      it('should generate a refresh token with longer expiry', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        const payload: JwtPayload = { sub: '123' };
        
        const refreshToken = jwtAuth.generateToken(payload, true);
        
        expect(refreshToken).toBe('mock-token');
        expect(jwt.sign).toHaveBeenCalledWith(
          payload,
          'test-secret',
          expect.objectContaining({ expiresIn: '7d' })
        );
      });
    });
    
    describe('issueTokens', () => {
      it('should issue access and refresh tokens', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        const payload: JwtPayload = { sub: '123' };
        
        const tokens = jwtAuth.issueTokens(payload);
        
        expect(tokens).toHaveProperty('accessToken', 'mock-token');
        expect(tokens).toHaveProperty('refreshToken', 'mock-token');
        expect(tokens).toHaveProperty('expiresIn', 3600);
        expect(tokens).toHaveProperty('tokenType', 'Bearer');
      });
    });
    
    describe('verifyToken middleware', () => {
      it('should call next() when token is valid', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        req.headers!.authorization = 'Bearer valid-token';
        
        (jwt.verify as jest.Mock).mockReturnValueOnce({ sub: '123' });
        
        jwtAuth.verifyToken(req as Request, res as Response, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({ sub: '123' });
      });
      
      it('should return 401 when authorization header is missing', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        
        jwtAuth.verifyToken(req as Request, res as Response, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No authorization token provided' });
        expect(next).not.toHaveBeenCalled();
      });
      
      it('should return 401 when token format is invalid', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        req.headers!.authorization = 'InvalidFormat';
        
        jwtAuth.verifyToken(req as Request, res as Response, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
        expect(next).not.toHaveBeenCalled();
      });
      
      it('should return 401 when token is expired', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        req.headers!.authorization = 'Bearer expired-token';
        
        const tokenExpiredError = new Error('Token expired') as any;
        tokenExpiredError.name = 'TokenExpiredError';
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
          throw tokenExpiredError;
        });
        
        jwtAuth.verifyToken(req as Request, res as Response, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' });
        expect(next).not.toHaveBeenCalled();
      });
    });
    
    describe('refreshToken', () => {
      it('should refresh token when valid refresh token is provided', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        req.body.refreshToken = 'valid-refresh-token';
        
        (jwt.verify as jest.Mock).mockReturnValueOnce({ sub: '123' });
        
        jwtAuth.refreshToken(req as Request, res as Response);
        
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }));
      });
      
      it('should return 400 when refresh token is missing', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        
        jwtAuth.refreshToken(req as Request, res as Response);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Refresh token is required' });
      });
      
      it('should return 401 when refresh token is invalid', () => {
        const jwtAuth = createJwtAuth({ secret: 'test-secret' });
        req.body.refreshToken = 'invalid-refresh-token';
        
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
          throw new Error('Invalid token');
        });
        
        jwtAuth.refreshToken(req as Request, res as Response);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid refresh token' });
      });
    });
  });
}); 