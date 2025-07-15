import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ClientTable } from './client-table';
import type { Client } from '@/lib/clients/core/schemas';
import type { ColumnDef } from '@tanstack/react-table';

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    company: 'Acme Inc',
    age: 30,
    gender: 'male',
    subscriptionCost: 1000,
    currency: 'USD',
    picture: 'https://example.com/john.jpg',
    registered: '2023-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    company: 'Tech Corp',
    age: 25,
    gender: 'female',
    subscriptionCost: 1500,
    currency: 'EUR',
    picture: 'https://example.com/jane.jpg',
    registered: '2023-02-20',
  },
];

const mockColumns: ColumnDef<Client>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'age', header: 'Age' },
  { id: 'actions', header: 'Actions' },
];

const createMockTable = () => ({
  getState: vi.fn(() => ({
    globalFilter: '',
    pagination: { pageIndex: 0, pageSize: 10 },
  })),
  setGlobalFilter: vi.fn(),
  getHeaderGroups: vi.fn(() => [
    {
      id: 'header-group-1',
      headers: [
        {
          id: 'name',
          isPlaceholder: false,
          column: { columnDef: { header: 'Name' } },
          getContext: vi.fn(),
        },
        {
          id: 'company',
          isPlaceholder: false,
          column: { columnDef: { header: 'Company' } },
          getContext: vi.fn(),
        },
      ],
    },
  ]),
  getRowModel: vi.fn(() => ({
    rows: [
      {
        id: '1',
        original: mockClients[0],
        getIsSelected: vi.fn(() => false),
        getVisibleCells: vi.fn(() => [
          {
            id: 'name-1',
            column: { columnDef: { cell: 'John Doe' } },
            getContext: vi.fn(),
          },
          {
            id: 'company-1',
            column: { columnDef: { cell: 'Acme Inc' } },
            getContext: vi.fn(),
          },
        ]),
      },
    ],
    flatRows: [],
    rowsById: {},
  })),
  getFilteredRowModel: vi.fn(() => ({
    rows: mockClients,
    flatRows: [],
    rowsById: {},
  })),
  previousPage: vi.fn(),
  nextPage: vi.fn(),
  getCanPreviousPage: vi.fn(() => false),
  getCanNextPage: vi.fn(() => true),
});

const mockTranslations: Record<string, string> = {
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.noResults': 'No results.',
  'common.previous': 'Previous',
  'common.next': 'Next',
  'clients.searchPlaceholder': 'Search client information...',
  'clients.showingClients': 'Showing {{start}}-{{end}} of {{total}} clients',
  'clients.noClients': 'No clients',
};

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => {
      const translation = mockTranslations[key] || key;
      if (params) {
        return translation.replace(
          /\{\{(\w+)\}\}/g,
          (match, paramName) => params[paramName]?.toString() || match,
        );
      }
      return translation;
    },
  }),
}));

vi.mock('./columns', () => ({
  useColumns: () => mockColumns,
}));

vi.mock('./use-client-table', () => ({
  useClientTable: vi.fn(),
}));

vi.mock('@/lib/clients/components/add-client/add-client', () => ({
  AddClient: () => <button>Add Client</button>,
}));

const mockUseClientTable = vi.mocked(
  await import('./use-client-table'),
).useClientTable;

describe('ClientTable', () => {
  let mockTable: ReturnType<typeof createMockTable>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTable = createMockTable();
  });

  it('should display loading state when data is being fetched', () => {
    // Arrange: Set up loading state with no data available
    mockUseClientTable.mockReturnValue({
      isLoading: true,
      error: null,
      table: mockTable as any,
    });

    // Act: Render component during loading state
    render(<ClientTable />);

    // Assert: Verify loading message is displayed
    expect(screen.getByText('Loading...')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('should display error message when data fetching fails', () => {
    // Arrange: Set up error state with specific error message
    const errorMessage = 'Failed to fetch clients';
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      table: mockTable as any,
    });

    // Act: Render component with error state
    render(<ClientTable />);

    // Assert: Verify error message is displayed with details
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('should render table with client data when loading completes successfully', () => {
    // Arrange: Set up successful data loading with client table
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render component with loaded client data
    render(<ClientTable />);

    // Assert: Verify table structure and data are displayed
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Company')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Acme Inc')).toBeDefined();
  });

  it('should filter table data when user types in search input', async () => {
    // Arrange: Set up user interaction with search functionality
    const user = userEvent.setup();
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render table and perform search operation
    render(<ClientTable />);
    const searchInput = screen.getByPlaceholderText(
      'Search client information...',
    );
    await user.type(searchInput, 'john');

    // Assert: Verify search filter is called for each character typed
    expect(mockTable.setGlobalFilter).toHaveBeenCalledWith('j');
    expect(mockTable.setGlobalFilter).toHaveBeenCalledWith('o');
    expect(mockTable.setGlobalFilter).toHaveBeenCalledWith('h');
    expect(mockTable.setGlobalFilter).toHaveBeenCalledWith('n');
  });

  it('should call pagination methods when pagination buttons are clicked', async () => {
    // Arrange: Set up pagination controls with enabled navigation
    const user = userEvent.setup();
    const mockPreviousPage = vi.fn();
    const mockNextPage = vi.fn();
    const interactiveTable = {
      ...mockTable,
      previousPage: mockPreviousPage,
      nextPage: mockNextPage,
      getCanPreviousPage: vi.fn(() => true),
      getCanNextPage: vi.fn(() => true),
    };

    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: interactiveTable as any,
    });

    // Act: Render table and click enabled pagination buttons
    render(<ClientTable />);
    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    await user.click(previousButton);
    await user.click(nextButton);

    // Assert: Verify pagination methods are called correctly
    expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    expect(mockNextPage).toHaveBeenCalledTimes(1);
  });

  it('should disable pagination buttons when navigation is not possible', () => {
    // Arrange: Set up pagination state with disabled navigation
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render table with pagination constraints
    render(<ClientTable />);

    // Assert: Verify button states reflect navigation availability
    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(previousButton).toHaveProperty('disabled', true);
    expect(nextButton).toHaveProperty('disabled', false);
  });

  it('should display empty state message when no clients exist', () => {
    // Arrange: Set up table with no client data available
    const emptyTable = {
      ...mockTable,
      getRowModel: vi.fn(() => ({
        rows: [],
        flatRows: [],
        rowsById: {},
      })),
    };

    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: emptyTable as any,
    });

    // Act: Render table with empty data set
    render(<ClientTable />);

    // Assert: Verify empty state message is displayed appropriately
    expect(screen.getByText('No results.')).toBeDefined();
    expect(screen.getByRole('table')).toBeDefined();
  });

  it('should show pagination summary with correct client counts', () => {
    // Arrange: Set up pagination summary with specific client data
    const paginatedTable = {
      ...mockTable,
      getState: vi.fn(() => ({
        globalFilter: '',
        pagination: { pageIndex: 0, pageSize: 10 },
      })),
      getFilteredRowModel: vi.fn(() => ({
        rows: Array(25)
          .fill(null)
          .map((_, i) => ({ id: `${i}` })),
        flatRows: [],
        rowsById: {},
      })),
    };

    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: paginatedTable as any,
    });

    // Act: Render table with pagination summary
    render(<ClientTable />);

    // Assert: Verify pagination summary displays correct counts
    expect(screen.getByText('Showing 1-10 of 25 clients')).toBeDefined();
  });

  it('should render search input with correct placeholder and styling', () => {
    // Arrange: Set up table component for search input validation
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render table and examine search input properties
    render(<ClientTable />);

    // Assert: Verify search input has correct attributes and styling
    const searchInput = screen.getByPlaceholderText(
      'Search client information...',
    );
    expect(searchInput).toBeDefined();
    expect(searchInput.className).toContain('pl-9');
    // Search icon is present but hidden from screen readers
    const container = searchInput.parentElement;
    expect(container?.querySelector('[aria-hidden="true"]')).toBeDefined();
  });

  it('should integrate with Add Client component correctly', () => {
    // Arrange: Set up table with Add Client component integration
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render table and verify Add Client integration
    render(<ClientTable />);

    // Assert: Verify Add Client button is present and accessible
    expect(screen.getByRole('button', { name: /add client/i })).toBeDefined();
  });

  it('should display translated content in English by default', () => {
    // Arrange: Set up component with English translation support
    mockUseClientTable.mockReturnValue({
      isLoading: false,
      error: null,
      table: mockTable as any,
    });

    // Act: Render component with default English translations
    render(<ClientTable />);

    // Assert: Verify English text content is displayed correctly
    expect(
      screen.getByPlaceholderText('Search client information...'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next/i })).toBeDefined();
  });
});
