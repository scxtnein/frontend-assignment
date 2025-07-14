import { ThemeToggle } from '@/lib/theme';
import { LanguageToggle } from '@/lib/i18n';

export const SettingsToggles = () => {
  return (
    <div className='flex gap-2'>
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
};
