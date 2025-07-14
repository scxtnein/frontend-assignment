import { ErrorAlreadyExists } from '@/lib/auth/core/errors';
import { useSignup } from '@/lib/auth/hooks/use-signup';
import { useForm } from '@tanstack/react-form';

export const useSignupForm = () => {
  const { mutateAsync } = useSignup();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value: { name, email, password }, formApi }) => {
      try {
        await mutateAsync({ name, email, password });
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            form: 'Failed to create account',
            fields: {
              email:
                error instanceof ErrorAlreadyExists
                  ? 'Email already exists'
                  : undefined,
            },
          },
        });
      }
    },
  });

  return { form };
};
