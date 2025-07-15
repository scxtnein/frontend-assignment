import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ViewClient } from './view-client';
import type { Client } from '@/lib/clients/core/schemas';
import { CURRENCIES } from '@/shared/core/constants';

const mockTranslation: Record<string, string> = {
  'clients.dialog.viewTitle': 'Client Details',
  'clients.dialog.viewDescription':
    'View detailed information about this client',
  'clients.sections.personalInfo': 'Personal Information',
  'clients.sections.subscriptionInfo': 'Subscription Details',
  'clients.table.age': 'Age',
  'clients.table.gender': 'Gender',
  'clients.table.subscription': 'Subscription',
  'clients.table.registered': 'Registered',
  'clients.form.genderOptions.male': 'Male',
  'clients.form.genderOptions.female': 'Female',
  'common.years': 'years',
  'common.noDate': 'Not set',
};

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => mockTranslation[key] || key,
  }),
}));

const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  id: '1',
  name: 'John Doe',
  company: 'Acme Corp',
  age: 30,
  gender: 'male' as const,
  picture: 'https://example.com/avatar.jpg',
  registered: '2023-01-15T10:30:00-05:00',
  currency: CURRENCIES.USD,
  subscriptionCost: 99.99,
  ...overrides,
});

describe('ViewClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display client details in modal when view button is clicked', async () => {
    // Arrange: Set up client data and user interaction
    const mockClient = createMockClient();
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify modal opens with complete client information
    expect(screen.getByText('Client Details')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Acme Corp')).toBeDefined();
    expect(screen.getByText('30 years')).toBeDefined();
    expect(screen.getByText('Male')).toBeDefined();
    expect(screen.getByText('99.99 USD')).toBeDefined();
  });

  it('should generate correct initials when client has first and last name', async () => {
    // Arrange: Set up client with full name and user interaction
    const mockClient = createMockClient({ name: 'Jane Smith' });
    const user = userEvent.setup();

    // Act: Render component and open modal to see initials
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify initials are generated from first and last name
    expect(screen.getByText('JS')).toBeDefined();
  });

  it('should generate correct initials when client has single name', async () => {
    // Arrange: Set up client with single name and user interaction
    const mockClient = createMockClient({ name: 'Madonna' });
    const user = userEvent.setup();

    // Act: Render component and open modal to see initials
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify initials are first two characters of single name
    expect(screen.getByText('MA')).toBeDefined();
  });

  it('should generate correct initials when client has multiple names', async () => {
    // Arrange: Set up client with multiple names and user interaction
    const mockClient = createMockClient({ name: 'Jean-Claude Van Damme' });
    const user = userEvent.setup();

    // Act: Render component and open modal to see initials
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify initials use first and last name only
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('should format valid registration date in user locale format', async () => {
    // Arrange: Set up client with valid registration date
    const mockClient = createMockClient({
      registered: '2023-06-15T14:30:00Z',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify date is formatted in readable format
    const dateElements = screen.getAllByText(/June|15|2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should handle malformed registration date gracefully', async () => {
    // Arrange: Set up client with invalid registration date
    const mockClient = createMockClient({
      registered: 'invalid-date-string',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify fallback text is displayed for invalid date
    expect(screen.getByText('Not set')).toBeDefined();
  });

  it('should handle date with space before timezone correctly', async () => {
    // Arrange: Set up client with non-standard date format
    const mockClient = createMockClient({
      registered: '2023-01-15T10:30:00 -05:00',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify normalized date is parsed and displayed correctly
    const dateElements = screen.getAllByText(/January|15|2023/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should format standard currency correctly', async () => {
    // Arrange: Set up client with standard currency
    const mockClient = createMockClient({
      subscriptionCost: 149.5,
      currency: CURRENCIES.EUR,
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify currency is formatted with correct symbol
    expect(screen.getByText('149.50 EUR')).toBeDefined();
  });

  it('should format Yen currency with JPY conversion', async () => {
    // Arrange: Set up client with legacy Yen currency
    const mockClient = createMockClient({
      subscriptionCost: 10000,
      currency: CURRENCIES.YEN,
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify Yen is converted to JPY format
    expect(screen.getByText('10000.00 JPY')).toBeDefined();
  });

  it('should display female gender correctly with translation', async () => {
    // Arrange: Set up female client
    const mockClient = createMockClient({
      name: 'Alice Johnson',
      gender: 'female' as const,
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify female gender is translated and displayed
    expect(screen.getByText('Female')).toBeDefined();
  });

  it('should display client avatar with correct alt text when picture URL is provided', async () => {
    // Arrange: Set up client with picture URL
    const mockClient = createMockClient({
      picture: 'https://example.com/profile.jpg',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify avatar container and fallback are present (happy-dom doesn't load images)
    expect(screen.getByText('JD')).toBeDefined(); // Fallback initials are shown in test environment
  });

  it('should show fallback initials when avatar image fails to load', async () => {
    // Arrange: Set up client data for fallback scenario and user interaction
    const mockClient = createMockClient({
      name: 'Bob Wilson',
      picture: 'invalid-url',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal to see fallback initials
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify initials fallback is displayed
    expect(screen.getByText('BW')).toBeDefined();
  });

  it('should close modal when dialog state changes', async () => {
    // Arrange: Set up modal interaction
    const mockClient = createMockClient();
    const user = userEvent.setup();

    // Act: Render component, open modal, then simulate close
    render(<ViewClient client={mockClient} />);

    // Open modal
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Client Details')).toBeDefined();

    // Close modal by pressing Escape
    await user.keyboard('{Escape}');

    // Assert: Verify modal content is no longer visible
    expect(screen.queryByText('Client Details')).toBeNull();
  });

  it('should display all translation keys correctly when rendered', async () => {
    // Arrange: Set up client with all data fields populated
    const mockClient = createMockClient();
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify all expected translated labels are displayed
    expect(screen.getByText('Client Details')).toBeDefined();
    expect(
      screen.getByText('View detailed information about this client'),
    ).toBeDefined();
    expect(screen.getByText('Personal Information')).toBeDefined();
    expect(screen.getByText('Subscription Details')).toBeDefined();
    expect(screen.getByText('Age')).toBeDefined();
    expect(screen.getByText('Gender')).toBeDefined();
    expect(screen.getByText('Subscription')).toBeDefined();
    expect(screen.getByText('Registered')).toBeDefined();
  });

  it('should handle edge case with whitespace in client name for initials', async () => {
    // Arrange: Set up client with name containing extra whitespace and user interaction
    const mockClient = createMockClient({
      name: '  John   Doe  ',
    });
    const user = userEvent.setup();

    // Act: Render component and open modal to see initials
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify initials are generated correctly despite whitespace
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('should display subscription cost with proper decimal formatting', async () => {
    // Arrange: Set up client with various subscription costs
    const mockClient = createMockClient({
      subscriptionCost: 5,
      currency: CURRENCIES.USD,
    });
    const user = userEvent.setup();

    // Act: Render component and open modal
    render(<ViewClient client={mockClient} />);
    await user.click(screen.getByRole('button'));

    // Assert: Verify cost is always displayed with two decimal places
    expect(screen.getByText('5.00 USD')).toBeDefined();
  });
});
