import { LoginForm } from '@/lib/auth/components/login-form';
import { Link } from '@tanstack/react-router';
import { GalleryVerticalEndIcon } from 'lucide-react';
import { SettingsToggles } from '@/shared/components/ui/settings-toggles';
import { useI18n } from '@/lib/i18n';

export const LoginPage = () => {
  const { t } = useI18n();

  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative'>
      <div className='absolute top-6 right-6'>
        <SettingsToggles />
      </div>
      <div className='w-full max-w-sm flex flex-col gap-6'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex flex-col items-center gap-2 font-medium'>
            <div className='flex size-8 items-center justify-center rounded-md'>
              <GalleryVerticalEndIcon className='size-6' />
            </div>
            <span className='sr-only'>{t('app.companyName')}</span>
          </div>
          <h1 className='text-xl font-bold'>{t('auth.loginPage.title')}</h1>
        </div>

        <LoginForm />

        <div className='text-center text-sm'>
          <span className='text-muted-foreground'>
            {t('auth.loginPage.noAccount')}
          </span>{' '}
          <Link to='/signup' className='underline underline-offset-4'>
            {t('auth.loginPage.signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
};
