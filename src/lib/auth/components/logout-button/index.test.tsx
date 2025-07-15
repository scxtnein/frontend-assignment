import { describe, it, expect } from 'vitest';
import { LogoutButton } from './index';

describe('LogoutButton index', () => {
  it('should export LogoutButton component correctly', () => {
    // Arrange: Component should be available from index

    // Act: Import component from index file

    // Assert: Verify component is properly exported
    expect(LogoutButton).toBeDefined();
    expect(typeof LogoutButton).toBe('function');
  });
});
