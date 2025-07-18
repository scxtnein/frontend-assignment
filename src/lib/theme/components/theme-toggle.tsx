import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '../providers';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const isSystemDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const currentTheme =
      theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={handleToggle}
      aria-label='Toggle theme'
    >
      <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
    </Button>
  );
};
