import { filePathToRegex } from './to-regex';

describe("to-regex", () => {
  it('should convert **/*.spec.ts', () => {
    const regex = filePathToRegex('**/*.spec.ts');

    expect(regex).toBe('.*\\/.*\\.spec\\.ts');
  });

  it('should convert **/mocks/**', () => {
    const regex = filePathToRegex('**/mocks/**');

    expect(regex).toBe('.*\\/mocks\\/.*');
  });

  it('should convert **/__test__/**', () => {
    const regex = filePathToRegex('**/__test__/**');

    expect(regex).toBe('.*\\/__test__\\/.*');
  });

  it('should convert *__tests__/*.[jt]s(x)?', () => {
    const regex = filePathToRegex('*__tests__/*.[jt]s(x)?');

    expect(regex).toBe('.*__tests__\\/.*\\.[jt]s(x)?');
  });

  it('should convert *(spec|test).[jt]s(x)?', () => {
    const regex = filePathToRegex('*(spec|test).[jt]s(x)?');

    expect(regex).toBe('.*(spec|test)\\.[jt]s(x)?');
  });
});
