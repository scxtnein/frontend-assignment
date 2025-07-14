import { useLogin } from '@/lib/auth/hooks/use-login';
import { useForm } from '@tanstack/react-form';

export const useLoginForm = () => {
  const { mutateAsync } = useLogin();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value: { email, password }, formApi }) => {
      try {
        await mutateAsync({ email, password });
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: 'Invalid email or password',
            fields: {},
          },
        });
      }
    },
  });

  return { form };
};
