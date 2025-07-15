import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AddClient } from './add-client';

// Mock functions
const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();
const mockHandleChange = vi.fn();
const mockHandleBlur = vi.fn();

// Mock translation strings
const mockTranslation: Record<string, string> = {
  'clients.addClient': 'Add Client',
  'clients.dialog.addTitle': 'Add New Client',
  'clients.dialog.addDescription':
    'Fill in the details to add a new client to your system.',
  'common.name': 'Name',
  'common.company': 'Company',
  'clients.form.age': 'Age',
  'clients.form.gender': 'Gender',
  'clients.form.subscriptionCost': 'Subscription Cost',
  'clients.form.placeholders.name': 'Enter client name',
  'clients.form.placeholders.company': 'Enter company name',
  'clients.form.placeholders.age': 'Enter age',
  'clients.form.placeholders.gender': 'Select gender',
  'clients.form.placeholders.currency': 'Currency',
  'clients.form.genderOptions.male': 'Male',
  'clients.form.genderOptions.female': 'Female',
};

// Mock form state
let mockFormState = {
  canSubmit: true,
  isSubmitting: false,
};

// Mock form creation
const createMockForm = (overrides = {}) => ({
  handleSubmit: mockHandleSubmit,
  reset: mockReset,
  Subscribe: ({ children, selector }: any) => {
    const state = { ...mockFormState, ...overrides };
    const result = selector(state);
    return children(result);
  },
  Field: ({ children, name }: any) => {
    const field = {
      name,
      state: {
        value: name === 'currency' ? 'USD' : '',
        meta: { errors: [] },
      },
      handleChange: mockHandleChange,
      handleBlur: mockHandleBlur,
    };
    return children(field);
  },
});

// Set up mocks
vi.mock('./use-add-client-form', () => ({
  useAddClientForm: vi.fn(),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => mockTranslation[key] || key,
  }),
}));

vi.mock('@/shared/core/constants', () => ({
  GENDER_OPTIONS: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ],
  CURRENCY_OPTIONS: {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
  },
}));

vi.mock('../shared/client-form-fields', () => ({
  ClientFormFields: () => (
    <div data-testid='client-form-fields'>
      <input data-testid='mock-form-field' />
    </div>
  ),
}));

describe('AddClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockFormState = {
      canSubmit: true,
      isSubmitting: false,
    };

    // Reset the mock implementation
    const { useAddClientForm } = (await vi.importMock(
      './use-add-client-form',
    )) as any;
    useAddClientForm.mockReturnValue({
      form: createMockForm(),
    });
  });

  it('should display add client button with icon and text when component loads', () => {
    // Arrange: Component ready for rendering

    // Act: Render the AddClient component
    render(<AddClient />);

    // Assert: Verify trigger button displays correct content
    const addButton = screen.getByRole('button', { name: /add client/i });
    expect(addButton).toBeDefined();
    expect(screen.getByText('Add Client')).toBeDefined();
  });

  it('should open dialog when user clicks add client button', async () => {
    // Arrange: Set up user interaction for dialog opening
    const user = userEvent.setup();

    // Act: Render component and click add button
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Assert: Verify dialog content is visible
    expect(screen.getByText('Add New Client')).toBeDefined();
    expect(
      screen.getByText(
        'Fill in the details to add a new client to your system.',
      ),
    ).toBeDefined();
    expect(screen.getByTestId('client-form-fields')).toBeDefined();
  });

  it('should submit form when user fills form and clicks submit button', async () => {
    // Arrange: Set up form submission scenario
    const user = userEvent.setup();

    // Act: Open dialog and submit form
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Find submit button within the dialog form
    const form = screen.getByRole('dialog').querySelector('form');
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    expect(submitButton).toBeDefined();
    await user.click(submitButton);

    // Assert: Verify form submission was triggered
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should close dialog and reset form when user cancels or closes dialog', async () => {
    // Arrange: Set up dialog close scenario
    const user = userEvent.setup();

    // Act: Open dialog then trigger close by pressing Escape
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Simulate dialog close by pressing Escape
    await user.keyboard('{Escape}');

    // Assert: Verify form reset was called
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should display translated content in dialog when opened', async () => {
    // Arrange: Set up translation verification scenario
    const user = userEvent.setup();

    // Act: Open dialog to verify translations
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Assert: Verify all translated strings are displayed
    expect(screen.getByText('Add New Client')).toBeDefined();
    expect(
      screen.getByText(
        'Fill in the details to add a new client to your system.',
      ),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /add client/i })).toBeDefined();
  });

  it('should disable submit button when form cannot be submitted', async () => {
    // Arrange: Set up form with canSubmit false
    const user = userEvent.setup();
    const { useAddClientForm } = (await vi.importMock(
      './use-add-client-form',
    )) as any;
    useAddClientForm.mockReturnValue({
      form: createMockForm({ canSubmit: false }),
    });

    // Act: Render component and open dialog
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Assert: Verify submit button is disabled
    const form = screen.getByRole('dialog').querySelector('form');
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    expect(submitButton).toBeDefined();
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('should show loading state when form is being submitted', async () => {
    // Arrange: Set up form with isSubmitting true
    const user = userEvent.setup();
    const { useAddClientForm } = (await vi.importMock(
      './use-add-client-form',
    )) as any;
    useAddClientForm.mockReturnValue({
      form: createMockForm({ isSubmitting: true }),
    });

    // Act: Render component and open dialog
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    // Assert: Verify submit button shows loading state with opacity change
    const form = screen.getByRole('dialog').querySelector('form');
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    expect(submitButton).toBeDefined();
    const buttonText = submitButton.querySelector('span');
    expect(buttonText?.className).toContain('opacity-70');
  });

  it('should prevent default form submission and handle through custom handler', async () => {
    // Arrange: Set up form submission event handling
    const user = userEvent.setup();

    // Act: Open dialog and submit form by clicking submit button
    render(<AddClient />);
    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    const form = screen.getByRole('dialog').querySelector('form');
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    expect(submitButton).toBeDefined();
    await user.click(submitButton);

    // Assert: Verify custom handler was called
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});
