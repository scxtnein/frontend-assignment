import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LogoutButton } from './logout-button';

const mockLogout = vi.fn();
let mockTranslation = 'Logout';

vi.mock('@/lib/auth/hooks/use-logout', () => ({
  useLogout: () => ({
    logout: mockLogout,
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      if (key === 'auth.logout') {
        return mockTranslation;
      }
      return key;
    },
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTranslation = 'Logout';
  });

  it('should render logout button and execute logout when user clicks it', async () => {
    // Arrange: Set up user interaction and expected logout behavior
    const user = userEvent.setup();

    // Act: Render component and click the logout button
    render(<LogoutButton />);
    const button = screen.getByRole('button');
    await user.click(button);

    // Assert: Verify button exists with correct text and logout was triggered
    expect(screen.getByText('Logout')).toBeDefined();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should display internationalized text in different languages', () => {
    // Arrange: Set up Japanese translation
    mockTranslation = 'ログアウト';

    // Act: Render component with Japanese translation
    render(<LogoutButton />);

    // Assert: Verify Japanese text is displayed
    expect(screen.getByText('ログアウト')).toBeDefined();
  });

  it('should apply outline button styling for visual consistency', () => {
    // Arrange: Component ready for styling verification

    // Act: Render component
    render(<LogoutButton />);

    // Assert: Verify outline variant styling is applied
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
  });
});
