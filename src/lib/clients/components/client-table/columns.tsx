import type { Client } from '@/lib/clients/core/schemas';
import { Button } from '@/shared/components/ui/button';
import { CURRENCIES } from '@/shared/core/constants';
import type { Column, ColumnDef, Row } from '@tanstack/react-table';
import { ArrowDownWideNarrowIcon } from 'lucide-react';
import { EditClient } from '@/lib/clients/components/edit-client';
import { DeleteClient } from '@/lib/clients/components/delete-client';
import { ViewClient } from '@/lib/clients/components/view-client';
import { useI18n } from '@/lib/i18n';

interface SortHeaderProps {
  column: Column<Client>;
  label: string;
}

const SortHeader = ({ column, label }: SortHeaderProps) => {
  const isDescending = column.getIsSorted() === 'desc';
  return (
    <Button
      className='w-full text-left justify-start'
      variant='ghost'
      onClick={() => column.toggleSorting(!isDescending)}
    >
      {label}
      <div className='size-4'>
        {isDescending && <ArrowDownWideNarrowIcon />}
      </div>
    </Button>
  );
};

interface SimpleCellProps {
  row: Row<Client>;
  columnId: string;
}

const SimpleCell = ({ row, columnId }: SimpleCellProps) => (
  <span className='pl-4'>{row.getValue(columnId)}</span>
);

export const useColumns = (): ColumnDef<Client>[] => {
  const { t } = useI18n();

  return [
    {
      accessorKey: 'name',
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => <SimpleCell row={row} columnId='name' />,
      header: ({ column }) => (
        <SortHeader column={column} label={t('clients.table.name')} />
      ),
    },
    {
      accessorKey: 'company',
      header: ({ column }) => (
        <SortHeader column={column} label={t('clients.table.company')} />
      ),
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => <SimpleCell row={row} columnId='company' />,
    },
    {
      id: 'subscription',
      enableSorting: true,
      enableHiding: true,
      accessorFn: (row) =>
        `${row.subscriptionCost} ${row.currency === CURRENCIES.YEN ? 'JPY' : row.currency}`,
      header: ({ column }) => (
        <SortHeader column={column} label={t('clients.table.subscription')} />
      ),
      cell: ({ getValue }) => (
        <span className='pl-4'>{getValue() as string}</span>
      ),
    },
    // Not included in README.md
    // {
    //   accessorKey: 'gender',
    //   enableSorting: true,
    //   enableHiding: true,
    //   header: ({ column }) => <SortHeader column={column} label={t('clients.table.gender')} />,
    //   cell: ({ row }) => (
    //     <span className='pl-4'>{t(`clients.form.genderOptions.${row.getValue('gender')}`)}</span>
    //   ),
    // },
    {
      enableSorting: true,
      enableHiding: true,
      accessorKey: 'age',
      header: ({ column }) => (
        <SortHeader column={column} label={t('clients.table.age')} />
      ),
      cell: ({ row }) => <SimpleCell row={row} columnId='age' />,
    },
    {
      id: 'actions',
      header: () => <span className='pl-2'>{t('common.actions')}</span>,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <ViewClient client={row.original} />
          <EditClient client={row.original} />
          <DeleteClient client={row.original} />
        </div>
      ),
    },
  ];
};
