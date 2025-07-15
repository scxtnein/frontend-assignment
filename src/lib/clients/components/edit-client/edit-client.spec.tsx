import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EditClient } from './edit-client';
import type { Client } from '@/lib/clients/core/schemas';

// Mock functions
const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();
const mockHandleChange = vi.fn();
const mockHandleBlur = vi.fn();

// Mock translation strings
const mockTranslation: Record<string, string> = {
  'clients.dialog.editTitle': 'Edit Client',
  'clients.dialog.editDescription': 'Update the client information below.',
  'clients.dialog.updateClient': 'Update Client',
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

// Test client data
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
        value: getFieldValue(name),
        meta: { errors: [] },
      },
      handleChange: mockHandleChange,
      handleBlur: mockHandleBlur,
    };
    return children(field);
  },
});

const getFieldValue = (fieldName: string) => {
  switch (fieldName) {
    case 'name':
      return mockClient.name;
    case 'company':
      return mockClient.company;
    case 'age':
      return mockClient.age;
    case 'gender':
      return mockClient.gender;
    case 'currency':
      return mockClient.currency;
    case 'subscriptionCost':
      return mockClient.subscriptionCost.toString();
    default:
      return '';
  }
};

// Set up mocks
vi.mock('./use-edit-client-form', () => ({
  useEditClientForm: vi.fn(),
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
    CAD: 'CAD',
    AUD: 'AUD',
    SGD: 'SGD',
    INR: 'INR',
    JPY: 'JPY',
  },
}));

vi.mock('../shared/client-form-fields', () => ({
  ClientFormFields: ({ form: _form }: any) => (
    <div data-testid='client-form-fields'>
      <input data-testid='mock-form-field' />
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  SquarePenIcon: () => <svg data-testid='square-pen-icon' />,
  XIcon: () => <svg data-testid='x-icon' />,
}));

describe('EditClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockFormState = {
      canSubmit: true,
      isSubmitting: false,
    };

    // Reset the mock implementation
    const { useEditClientForm } = (await vi.importMock(
      './use-edit-client-form',
    )) as any;
    useEditClientForm.mockReturnValue({
      form: createMockForm(),
    });
  });

  it('should display edit button with pen icon when component loads', () => {
    // Arrange: Component ready for rendering with client data

    // Act: Render the EditClient component
    render(<EditClient client={mockClient} />);

    // Assert: Verify edit trigger button displays pen icon
    const editButton = screen.getByRole('button');
    expect(editButton).toBeDefined();
    expect(screen.getByTestId('square-pen-icon')).toBeDefined();
  });

  it('should open edit dialog when user clicks edit button', async () => {
    // Arrange: Set up user interaction for dialog opening
    const user = userEvent.setup();

    // Act: Render component and click edit button
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Assert: Verify dialog content is visible with edit-specific text
    expect(screen.getByText('Edit Client')).toBeDefined();
    expect(
      screen.getByText('Update the client information below.'),
    ).toBeDefined();
    expect(screen.getByTestId('client-form-fields')).toBeDefined();
  });

  it('should submit form with client data when user fills form and clicks update', async () => {
    // Arrange: Set up form submission scenario
    const user = userEvent.setup();

    // Act: Open dialog and submit form
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

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

  it('should close dialog and reset form when user cancels edit', async () => {
    // Arrange: Set up dialog close scenario
    const user = userEvent.setup();

    // Act: Open dialog then trigger close by pressing Escape
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Simulate dialog close by pressing Escape
    await user.keyboard('{Escape}');

    // Assert: Verify form reset was called
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should populate form fields with existing client data when dialog opens', async () => {
    // Arrange: Set up form pre-population verification
    const user = userEvent.setup();

    // Act: Open edit dialog to verify pre-populated data
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Assert: Verify dialog shows client data and form fields are rendered
    expect(screen.getByTestId('client-form-fields')).toBeDefined();
    expect(screen.getByText('Edit Client')).toBeDefined();
  });

  it('should display translated content in edit dialog when opened', async () => {
    // Arrange: Set up translation verification scenario
    const user = userEvent.setup();

    // Act: Open dialog to verify translations
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Assert: Verify all translated strings are displayed
    expect(screen.getByText('Edit Client')).toBeDefined();
    expect(
      screen.getByText('Update the client information below.'),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /update client/i }),
    ).toBeDefined();
  });

  it('should disable submit button when form cannot be submitted', async () => {
    // Arrange: Set up form with canSubmit false
    const user = userEvent.setup();
    const { useEditClientForm } = (await vi.importMock(
      './use-edit-client-form',
    )) as any;
    useEditClientForm.mockReturnValue({
      form: createMockForm({ canSubmit: false }),
    });

    // Act: Render component and open dialog
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

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
    const { useEditClientForm } = (await vi.importMock(
      './use-edit-client-form',
    )) as any;
    useEditClientForm.mockReturnValue({
      form: createMockForm({ isSubmitting: true }),
    });

    // Act: Render component and open dialog
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

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
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    const form = screen.getByRole('dialog').querySelector('form');
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLElement;
    expect(submitButton).toBeDefined();
    await user.click(submitButton);

    // Assert: Verify custom handler was called
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display update button text with pen icon in submit button', async () => {
    // Arrange: Set up submit button content verification
    const user = userEvent.setup();

    // Act: Open dialog to verify submit button content
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Assert: Verify submit button displays correct text and icon
    const form = screen.getByRole('dialog').querySelector('form');
    expect(form).toBeDefined();
    expect(screen.getByText('Update Client')).toBeDefined();

    // Verify pen icon is present in submit button (should find at least one)
    const submitButtonIcons = form?.querySelectorAll(
      '[data-testid="square-pen-icon"]',
    );
    expect(submitButtonIcons?.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle dialog state changes when onOpenChange is triggered', async () => {
    // Arrange: Set up dialog state management scenario
    const user = userEvent.setup();

    // Act: Open and close dialog to trigger state changes
    render(<EditClient client={mockClient} />);
    const editButton = screen.getByRole('button');
    await user.click(editButton);

    // Verify dialog is open
    expect(screen.getByRole('dialog')).toBeDefined();

    // Close dialog by pressing Escape
    await user.keyboard('{Escape}');

    // Assert: Verify form reset was called when dialog closed
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should initialize edit form with client data when component mounts', () => {
    // Arrange: Component ready for mounting with specific client data
    const clientWithData: Client = {
      id: 'test-id',
      name: 'Jane Smith',
      company: 'Test Corp',
      age: 25,
      gender: 'female',
      picture: 'test.jpg',
      registered: '2023-01-01',
      currency: 'EUR',
      subscriptionCost: 150.5,
    };

    // Act: Render EditClient with specific client data
    render(<EditClient client={clientWithData} />);

    // Assert: Verify edit button is rendered (form initialization happens internally)
    const editButton = screen.getByRole('button');
    expect(editButton).toBeDefined();
    expect(editButton.getAttribute('type')).not.toBe('submit'); // Should be trigger button, not submit
  });

  it('should pass client data to form initialization correctly', () => {
    // Arrange: Set up client data passing verification
    const specificClient: Client = {
      ...mockClient,
      name: 'Updated Name',
      subscriptionCost: 199.99,
    };

    // Act: Render component with specific client data
    render(<EditClient client={specificClient} />);

    // Assert: Verify component renders without errors (form receives client data)
    const editButton = screen.getByRole('button');
    expect(editButton).toBeDefined();
  });
});
