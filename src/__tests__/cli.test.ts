import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import { jest } from '@jest/globals';

const CLI_PATH = path.resolve(__dirname, '../../bin/cli.js');
const TEST_DIR = path.resolve(__dirname, '../__test_workspace__');

// Mock console.log and console.error to prevent test output clutter
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
  throw new Error(`Process exited with code ${code}`);
});

// Helper function to run CLI commands
const runCommand = (args: string): string => {
  try {
    return execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf8',
      cwd: TEST_DIR
    });
  } catch (error) {
    return (error as any).stdout || (error as any).message;
  }
};

describe('CLI Commands', () => {
  beforeAll(() => {
    // Create test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.removeSync(TEST_DIR);
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.removeSync(TEST_DIR);
    }
  });

  it('should display help when run without arguments', () => {
    const output = runCommand('--help');
    expect(output).toContain('awesome-express');
    expect(output).toContain('Commands:');
  });

  it('should display version information', () => {
    const output = runCommand('--version');
    // Match semver format (digits and dots)
    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });
}); 