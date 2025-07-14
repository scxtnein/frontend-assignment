import { EyeIcon } from 'lucide-react';
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { useI18n } from '@/lib/i18n';
import type { Client } from '@/lib/clients/core/schemas';
import { CURRENCIES } from '@/shared/core/constants';

interface ViewClientProps {
  client: Client;
}

const getInitials = (name: string) => {
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0].slice(0, 2).toUpperCase();
};

export const ViewClient = ({ client }: ViewClientProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // Format date based on user's locale
  const formatDate = (dateString: string) => {
    try {
      // Handle the non-standard date format with space before timezone
      const normalizedDate = dateString.replace(' -', '-').replace(' +', '+');
      const date = new Date(normalizedDate);
      if (isNaN(date.getTime())) {
        return t('common.noDate') || 'Not set';
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return t('common.noDate') || 'Not set';
    }
  };

  // Format currency
  const formatCurrency = (cost: number, currency: string) => {
    const displayCurrency = currency === CURRENCIES.YEN ? 'JPY' : currency;
    return `${cost.toFixed(2)} ${displayCurrency}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost'>
          <EyeIcon className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='text-lg font-semibold'>
            {t('clients.dialog.viewTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {t('clients.dialog.viewDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header Section with Avatar and Primary Info */}
          <div className='flex items-center gap-4'>
            <Avatar className='w-14 h-14'>
              <AvatarImage src={client.picture} alt={client.name} />
              <AvatarFallback className='text-lg font-medium bg-muted'>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold truncate'>
                {client.name}
              </h3>
              <p className='text-sm text-muted-foreground truncate'>
                {client.company}
              </p>
            </div>
          </div>

          <div className='h-px bg-border' />

          {/* Personal Information Section */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-foreground'>
              {t('clients.sections.personalInfo')}
            </h4>
            <div className='grid gap-2'>
              <div className='grid grid-cols-[120px_1fr] gap-4 text-sm'>
                <span className='text-muted-foreground'>
                  {t('clients.table.age')}
                </span>
                <span className='font-medium'>
                  {client.age} {t('common.years')}
                </span>
              </div>
              <div className='grid grid-cols-[120px_1fr] gap-4 text-sm'>
                <span className='text-muted-foreground'>
                  {t('clients.table.gender')}
                </span>
                <span className='font-medium'>
                  {t(`clients.form.genderOptions.${client.gender}`)}
                </span>
              </div>
            </div>
          </div>

          <div className='h-px bg-border' />

          {/* Subscription Details Section */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-foreground'>
              {t('clients.sections.subscriptionInfo')}
            </h4>
            <div className='grid gap-2'>
              <div className='grid grid-cols-[120px_1fr] gap-4 text-sm'>
                <span className='text-muted-foreground'>
                  {t('clients.table.subscription')}
                </span>
                <span className='font-medium'>
                  {formatCurrency(client.subscriptionCost, client.currency)}
                </span>
              </div>
              <div className='grid grid-cols-[120px_1fr] gap-4 text-sm'>
                <span className='text-muted-foreground'>
                  {t('clients.table.registered')}
                </span>
                <span className='font-medium'>
                  {formatDate(client.registered)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
