import { Languages } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '../providers';

export const LanguageToggle = () => {
  const { language, setLanguage } = useI18n();

  const handleToggle = () => {
    const nextLanguage = language === 'en' ? 'jp' : 'en';
    setLanguage(nextLanguage);
  };

  return (
    <Button
      variant={language === 'jp' ? 'default' : 'outline'}
      size='icon'
      onClick={handleToggle}
      aria-label='Toggle language'
      title={`Current: ${language === 'en' ? 'English' : '日本語'} - Click to switch`}
      className={language === 'jp' ? 'bg-primary text-primary-foreground' : ''}
    >
      <Languages className='h-[1.2rem] w-[1.2rem]' />
      <span className={`absolute -bottom-1 -right-1 border rounded text-[10px] px-1 py-0 min-w-[16px] text-center ${
        language === 'jp' 
          ? 'bg-background text-foreground' 
          : 'bg-background text-foreground'
      }`}>
        {language.toUpperCase()}
      </span>
      <span className='sr-only'>
        {language === 'en' ? 'Switch to Japanese' : 'Switch to English'}
      </span>
    </Button>
  );
};
