import express, { Express, Request, Response, NextFunction } from 'express';
import * as spdy from 'spdy';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for setting up the HTTP/2 server
 */
export interface Http2Options {
  // SSL certificate options
  cert: string;
  key: string;
  
  // Optional settings
  port?: number;
  useHttp1Fallback?: boolean;
}

/**
 * Creates an Express application with HTTP/2 support
 */
export function createHttp2App(): Express {
  return express();
}

/**
 * Starts an HTTP/2 server with the provided Express app
 */
export function startHttp2Server(app: Express, options: Http2Options): Promise<void> {
  const serverOptions = {
    cert: fs.readFileSync(options.cert),
    key: fs.readFileSync(options.key),
    spdy: {
      protocols: ['h2', 'http/1.1'] as any,
      plain: false,
      ssl: true,
      'x-forwarded-for': true
    }
  };

  const port = options.port || 3000;

  return new Promise((resolve, reject) => {
    const server = spdy.createServer(serverOptions as spdy.ServerOptions, app);
    
    server.listen(port, () => {
      console.log(`HTTP/2 server listening on port ${port}`);
      resolve();
    });

    server.on('error', (error: Error) => {
      console.error('Error starting HTTP/2 server:', error);
      reject(error);
    });
  });
}

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  });
}

// Re-export Express types and functions for convenience
export { Express, Request, Response, NextFunction };
export default { createHttp2App, startHttp2Server, errorHandler }; 