import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DeleteClient } from './delete-client';
import type { Client } from '@/lib/clients/core/schemas';

const mockHandleDelete = vi.fn();
const mockSetIsOpen = vi.fn();

let mockDialogState = {
  isOpen: false,
  isPending: false,
};

const mockTranslation: Record<string, string> = {
  'clients.deleteDialog.title': 'Delete Client',
  'clients.deleteDialog.description':
    'Are you sure you want to delete {{clientName}}? This action cannot be undone.',
  'clients.deleteDialog.cancel': 'Cancel',
  'clients.deleteDialog.delete': 'Delete',
  'clients.deleteDialog.deleting': 'Deleting...',
};

const mockClient: Client = {
  id: 'client-123',
  name: 'John Doe',
  company: 'Acme Corp',
  age: 30,
  gender: 'male',
  picture: 'https://example.com/photo.jpg',
  registered: '2023-01-15',
  currency: 'USD',
  subscriptionCost: 99.99,
};

vi.mock('./use-delete-client', () => ({
  useDeleteClientDialog: vi.fn(),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, options?: { clientName?: string }) => {
      const template = mockTranslation[key] || key;
      if (options?.clientName) {
        return template.replace('{{clientName}}', options.clientName);
      }
      return template;
    },
  }),
}));

vi.mock('lucide-react', () => ({
  TrashIcon: () => <svg data-testid='trash-icon' />,
}));

describe('DeleteClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockDialogState = {
      isOpen: false,
      isPending: false,
    };

    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: mockDialogState.isOpen,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: mockDialogState.isPending,
    });
  });

  it('should display delete button with trash icon when component loads', () => {
    // Arrange: Component ready for rendering with client data

    // Act: Render the DeleteClient component
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify delete button displays trash icon
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeDefined();
    expect(screen.getByTestId('trash-icon')).toBeDefined();
  });

  it('should open confirmation dialog when user clicks delete button', async () => {
    // Arrange: Set up user interaction for dialog opening with initial closed state

    // Start with dialog closed
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Render component with closed dialog
    render(<DeleteClient client={mockClient} />);

    // Now mock the open state to simulate dialog opening
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Re-render to show the dialog as open
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify dialog content is visible with client-specific information
    expect(screen.getByText('Delete Client')).toBeDefined();
    expect(
      screen.getByText(
        'Are you sure you want to delete John Doe? This action cannot be undone.',
      ),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDefined();
  });

  it('should call handleDelete with client ID when user confirms deletion', async () => {
    // Arrange: Set up delete confirmation scenario
    const user = userEvent.setup();
    mockDialogState.isOpen = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Open dialog and click delete button
    render(<DeleteClient client={mockClient} />);
    const deleteConfirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteConfirmButton);

    // Assert: Verify handleDelete was called with correct client ID
    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    expect(mockHandleDelete).toHaveBeenCalledWith('client-123');
  });

  it('should show loading state when deletion is in progress', async () => {
    // Arrange: Set up deletion pending state
    mockDialogState.isOpen = true;
    mockDialogState.isPending = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: true,
    });

    // Act: Render component with pending deletion state
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify delete button shows loading state and is disabled
    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    expect(deleteButton).toBeDefined();
    expect(deleteButton).toHaveProperty('disabled', true);
    expect(screen.getByText('Deleting...')).toBeDefined();
  });

  it('should call setIsOpen when user cancels deletion', async () => {
    // Arrange: Set up cancel action scenario
    const user = userEvent.setup();
    mockDialogState.isOpen = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Open dialog and click cancel button
    render(<DeleteClient client={mockClient} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Assert: Verify dialog state management is called
    expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
  });

  it('should display translated content for all dialog elements', async () => {
    // Arrange: Set up translation verification scenario
    mockDialogState.isOpen = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Render component with dialog open
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify all translated strings are displayed correctly
    expect(screen.getByText('Delete Client')).toBeDefined();
    expect(
      screen.getByText(
        'Are you sure you want to delete John Doe? This action cannot be undone.',
      ),
    ).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
    expect(screen.getByText('Delete')).toBeDefined();
  });

  it('should interpolate client name in delete confirmation message', async () => {
    // Arrange: Set up client name interpolation test
    const clientWithDifferentName: Client = {
      ...mockClient,
      name: 'Jane Smith',
    };
    mockDialogState.isOpen = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Render component with different client name
    render(<DeleteClient client={clientWithDifferentName} />);

    // Assert: Verify client name is correctly interpolated in confirmation message
    expect(
      screen.getByText(
        'Are you sure you want to delete Jane Smith? This action cannot be undone.',
      ),
    ).toBeDefined();
  });

  it('should prevent deletion when delete button is disabled during pending state', async () => {
    // Arrange: Set up disabled state verification
    mockDialogState.isOpen = true;
    mockDialogState.isPending = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: true,
    });

    // Act: Render component in pending state
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify delete button is disabled and shows pending text
    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    expect(deleteButton).toHaveProperty('disabled', true);
    expect(deleteButton.className).toContain('bg-destructive');
    expect(deleteButton.className).toContain('text-destructive-foreground');
  });

  it('should apply destructive styling to delete confirmation button', async () => {
    // Arrange: Set up styling verification scenario
    mockDialogState.isOpen = true;
    const { useDeleteClientDialog } = (await vi.importMock(
      './use-delete-client',
    )) as any;
    useDeleteClientDialog.mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      handleDelete: mockHandleDelete,
      isPending: false,
    });

    // Act: Render component with dialog open
    render(<DeleteClient client={mockClient} />);

    // Assert: Verify delete button has correct destructive styling classes
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton.className).toContain('bg-destructive');
    expect(deleteButton.className).toContain('text-destructive-foreground');
  });
});
