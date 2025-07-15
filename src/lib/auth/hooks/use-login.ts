import {
  userSchema,
  type LoginPayload,
  type User,
} from '@/lib/auth/core/schemas';
import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { kyClient } from '@/shared/core/ky-client';
import { handleAuthError } from '@/shared/utils/http-error-handler';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

export const useLogin = () => {
  const { t } = useI18n();
  const { setIsLoading, setUser } = useAuthProvider();
  const navigate = useNavigate();

  return useMutation<User, Error, LoginPayload>({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const response = await kyClient
        .get(`users?email=${encodeURIComponent(email)}`)
        .json();

      const parsedUsers = userSchema.array().safeParse(response);
      if (!parsedUsers.success) {
        console.log({ response, parsedUsers });
        throw new Error('Invalid response from server');
      }

      const user = parsedUsers.data.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      return user;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success(t('auth.toasts.loginSuccess'));
      navigate({ to: '/' });
    },
    onError: async (error) => {
      const errorMessage = await handleAuthError(error, t);
      toast.error(errorMessage);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
};
