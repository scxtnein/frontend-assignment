import { flexRender } from '@tanstack/react-table';

import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import { Input } from '@/shared/components/ui/input';
import { AddClient } from '@/lib/clients/components/add-client/add-client';
import { SearchIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

import { useColumns } from './columns';
import { useClientTable } from './use-client-table';

export const ClientTable = () => {
  const { t } = useI18n();
  const columns = useColumns();
  const { isLoading, error, table } = useClientTable(columns);

  if (isLoading) return <div>{t('common.loading')}</div>;
  if (error)
    return (
      <div>
        {t('common.error')}: {error.message}
      </div>
    );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='relative max-w-xs w-full'>
          <SearchIcon
            size={16}
            className='text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2'
            aria-hidden='true'
          />
          <Input
            placeholder={t('clients.searchPlaceholder')}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className='pl-9 w-full'
          />
        </div>

        <AddClient />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {(() => {
            const { pageIndex, pageSize } = table.getState().pagination;
            const totalRows = table.getFilteredRowModel().rows.length;
            const start = pageIndex * pageSize + 1;
            const end = Math.min((pageIndex + 1) * pageSize, totalRows);

            return totalRows > 0
              ? t('clients.showingClients', { start, end, total: totalRows })
              : t('clients.noClients');
          })()}
        </div>
        <div className='space-x-2'>
          <Button
            size='sm'
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
          >
            {t('common.previous')}
          </Button>
          <Button
            size='sm'
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
          >
            {t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};
