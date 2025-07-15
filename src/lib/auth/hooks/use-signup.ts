import { uid } from 'uid';
import {
  userSchema,
  type SignupPayload,
  type User,
} from '@/lib/auth/core/schemas';
import { useAuthProvider } from '@/lib/auth/hooks/use-auth-provider';
import { kyClient } from '@/shared/core/ky-client';
import { handleHttpError } from '@/shared/utils/http-error-handler';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { ErrorAlreadyExists } from '@/lib/auth/core/errors';
import { useI18n } from '@/lib/i18n';

export const useSignup = () => {
  const { t } = useI18n();
  const { setIsLoading, setUser } = useAuthProvider();
  const navigate = useNavigate();

  return useMutation<User, Error, SignupPayload>({
    mutationFn: async ({ name, email, password }: SignupPayload) => {
      // Check if email already exists
      const response = await kyClient
        .get(`users?email=${encodeURIComponent(email)}`)
        .json();

      const parsedUsers = userSchema.array().safeParse(response);
      if (!parsedUsers.success) {
        console.log({ response, parsedUsers });
        throw new Error('Invalid response from server');
      }

      if (parsedUsers.data.length > 0) {
        throw new ErrorAlreadyExists();
      }

      const newUser = {
        id: uid(6),
        name,
        email,
        password,
      };

      const createdUser = await kyClient
        .post('users', { json: newUser })
        .json();

      return userSchema.parse(createdUser);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (user) => {
      setUser(user);
      navigate({ to: '/' });

      // Short delay after successful signup to avoid flashing from json-server new entry
      toast.success(t('auth.toasts.signupSuccess', { userName: user.name }));
    },
    onError: async (error) => {
      if (error instanceof ErrorAlreadyExists) {
        toast.error(error.message);
        return;
      }

      const apiError = await handleHttpError(error, t);
      toast.error(apiError.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
};
