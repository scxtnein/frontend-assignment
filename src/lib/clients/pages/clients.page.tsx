import { LogoutButton } from '@/lib/auth/components/logout-button';
import { ClientTable } from '@/lib/clients/components/client-table';
import { SettingsToggles } from '@/shared/components/ui/settings-toggles';
import { useI18n } from '@/lib/i18n';
import { GalleryVerticalEndIcon } from 'lucide-react';

export const ClientsPage = () => {
  const { t } = useI18n();

  return (
    <div className='container mx-auto max-w-4xl relative'>
      <div className='absolute top-6 right-0'>
        <SettingsToggles />
      </div>
      <div className='flex justify-between items-center mb-6 h-20'>
        <div className='flex gap-4 items-center'>
          <GalleryVerticalEndIcon className='size-5' />
          <h1 className='text-xl font-bold'>{t('app.title')}</h1>
        </div>
      </div>
      <ClientTable />
      <div className='my-8'>
        <LogoutButton />
      </div>
    </div>
  );
};
