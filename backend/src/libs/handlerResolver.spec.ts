import { handlerPath } from './handlerResolver';

describe('handlerPath', () => {
  const originalCwd = process.cwd;

  beforeAll(() => {
    process.cwd = jest.fn(() => '/home/user/project/backend');
  });

  afterAll(() => {
    process.cwd = originalCwd;
  });

  it('should resolve the relative path from the current working directory on Linux/macOS', () => {
    const context = '/home/user/project/backend/src/functions/http/getEntries';
    const result = handlerPath(context);
    expect(result).toBe('src/functions/http/getEntries');
  });

  it('should handle Windows-style backslashes by replacing them with forward slashes', () => {
    // Note: handlerPath uses process.cwd() to split.
    // If we mock process.cwd() to return a Windows-style path, we can test the replacement.
    (process.cwd as jest.Mock).mockReturnValueOnce('C:\\user\\project\\backend');
    const context = 'C:\\user\\project\\backend\\src\\functions\\http\\getEntries';

    const result = handlerPath(context);
    expect(result).toBe('src/functions/http/getEntries');
  });

  it('should correctly handle paths with mixed slashes if they occur', () => {
    (process.cwd as jest.Mock).mockReturnValueOnce('/home/user/project/backend');
    const context = '/home/user/project/backend/src\\functions/http\\getEntries';
    const result = handlerPath(context);
    expect(result).toBe('src/functions/http/getEntries');
  });
});
