import { PowerIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useLogout } from '@/lib/auth/hooks/use-logout';
import { useI18n } from '@/lib/i18n';

export const LogoutButton = () => {
  const { t } = useI18n();
  const { logout } = useLogout();

  return (
    <Button variant='outline' onClick={logout}>
      <PowerIcon className='size-4' />
      <span>{t('auth.logout')}</span>
    </Button>
  );
};
