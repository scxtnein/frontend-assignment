import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

export const useLogout = () => {
  const { t } = useI18n();
  const { setUser } = useAuthProvider();
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    toast.success(t('auth.toasts.logoutSuccess'));
    navigate({ to: '/login' });
  };

  return { logout };
};
