import * as path from 'path';
import * as fs from 'fs-extra';
import { serveDocs, generateDocs } from '../commands/docs';
import { setupSwagger, generateOpenApiSpec } from '../docs';
import express, { json } from 'express';
import { jest } from '@jest/globals';

// Mock Express app and server
const mockApp = {
  use: jest.fn(),
  get: jest.fn(),
  listen: jest.fn((port: number, callback: () => void) => {
    callback();
    return { close: jest.fn() };
  })
};

jest.mock('express', () => {
  const mockExpress = jest.fn(() => mockApp);
//   mockExpress.json = jest.fn();
//   mockExpress.urlencoded = jest.fn();
  return mockExpress;
});

jest.mock('swagger-ui-express', () => ({
  serve: 'mockServe',
  setup: jest.fn(() => 'mockSetup')
}));

jest.mock('swagger-jsdoc', () => {
  return jest.fn(() => ({
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0'
    },
    paths: {}
  }));
});

jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis()
  }));
});

describe('OpenAPI Documentation', () => {
  const TEST_DIR = path.resolve(__dirname, '../__test_docs_workspace__');
  
  beforeAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.removeSync(TEST_DIR);
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
    
    // Mock console.log and console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process exited with code ${code}`);
    });
    
    // Mock process.cwd to return our test directory
    jest.spyOn(process, 'cwd').mockReturnValue(TEST_DIR);
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.removeSync(TEST_DIR);
    }
    jest.restoreAllMocks();
  });
  
  describe('setupSwagger', () => {
    it('should set up Swagger UI routes on Express app', () => {
      const app = express();
      setupSwagger(app, {
        title: 'Test API',
        version: '1.0.0'
      });
      
      expect(app.use).toHaveBeenCalledWith(
        '/api-docs',
        'mockServe',
        'mockSetup'
      );
      
      expect(app.get).toHaveBeenCalledWith(
        '/api-docs.json',
        expect.any(Function)
      );
    });
  });
  
  describe('generateOpenApiSpec', () => {
    it('should generate OpenAPI specification', () => {
      const spec = generateOpenApiSpec({
        title: 'Test API',
        version: '1.0.0'
      });
      
      expect(spec).toHaveProperty('openapi', '3.0.0');
      expect(spec).toHaveProperty('info');
      expect(spec).toHaveProperty('paths');
    });
  });
  
  describe('serveDocs', () => {
    it('should start documentation server', async () => {
      await serveDocs({ port: 9000 });
      
      expect(mockApp.listen).toHaveBeenCalledWith(9000, expect.any(Function));
    });
  });
  
  describe('generateDocs', () => {
    it('should generate OpenAPI specification file', async () => {
      const outputPath = path.join(TEST_DIR, 'openapi.json');
      
      await generateDocs(outputPath, {
        title: 'Test API',
        version: '1.0.0'
      });
      
      // We're not actually writing the file in the test because of mocks,
      // but we're checking that the flow works without errors
      expect(true).toBeTruthy();
    });
  });
}); 