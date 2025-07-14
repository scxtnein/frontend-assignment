import { SquarePenIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { useEditClientForm } from './use-edit-client-form';
import { ClientFormFields } from '../shared/client-form-fields';
import type { Client } from '@/lib/clients/core/schemas';

interface EditClientProps {
  client: Client;
}

export const EditClient = ({ client }: EditClientProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { form } = useEditClientForm(client, () => setOpen(false));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await form.handleSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <SquarePenIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('clients.dialog.editTitle')}</DialogTitle>
          <DialogDescription>
            {t('clients.dialog.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <ClientFormFields form={form} />

          {/* Submit Button */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type='submit' className='w-full' disabled={!canSubmit}>
                <SquarePenIcon className='size-4' />
                <span
                  className={`transition-opacity ${
                    isSubmitting ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {t('clients.dialog.updateClient')}
                </span>
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
};
