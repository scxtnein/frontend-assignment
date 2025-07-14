import { TrashIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { useI18n } from '@/lib/i18n';
import { useDeleteClientDialog } from './use-delete-client';
import type { Client } from '@/lib/clients/core/schemas';

interface DeleteClientProps {
  client: Client;
}

export const DeleteClient = ({ client }: DeleteClientProps) => {
  const { t } = useI18n();
  const { isOpen, setIsOpen, handleDelete, isPending } =
    useDeleteClientDialog();

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <TrashIcon className='size-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('clients.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('clients.deleteDialog.description', { clientName: client.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('clients.deleteDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(client.id)}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? t('clients.deleteDialog.deleting') : t('clients.deleteDialog.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
