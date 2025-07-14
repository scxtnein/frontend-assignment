import { useState, useEffect } from 'react';

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type PaginationState,
  type ColumnDef,
} from '@tanstack/react-table';

import type { Client } from '@/lib/clients/core/schemas';
import { useClientsQuery } from '@/lib/clients/hooks/use-clients-query';

export const useClientTable = (columns: ColumnDef<Client>[]) => {
  const { data, isLoading, error } = useClientsQuery();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    autoResetPageIndex: false, // Prevent automatic reset to page 1 on data changes
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  // Handle edge case: adjust pageIndex if current page becomes invalid after deletion
  useEffect(() => {
    const { rows } = table.getFilteredRowModel();
    const pageCount = table.getPageCount();
    
    if (rows.length > 0 && pagination.pageIndex >= pageCount) {
      // Move to last valid page
      setPagination(prev => ({
        ...prev,
        pageIndex: Math.max(0, pageCount - 1),
      }));
    }
  }, [data, globalFilter, pagination.pageIndex, table]);

  return {
    isLoading,
    error,
    table,
  };
};
