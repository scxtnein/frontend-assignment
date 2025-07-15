import { UserRoundPlusIcon } from 'lucide-react';
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
import { useAddClientForm } from './use-add-client-form';
import { ClientFormFields } from '../shared/client-form-fields';

export const AddClient = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { form } = useAddClientForm(() => setOpen(false));

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
        <Button variant='outline'>
          <UserRoundPlusIcon className='size-4' />
          <span>{t('clients.addClient')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('clients.dialog.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('clients.dialog.addDescription')}
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
                <UserRoundPlusIcon className='size-4' />
                <span
                  className={`transition-opacity ${
                    isSubmitting ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  {t('clients.addClient')}
                </span>
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
};
