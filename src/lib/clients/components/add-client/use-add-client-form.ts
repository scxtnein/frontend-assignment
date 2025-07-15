import { useAddClient } from '@/lib/clients/core/queries';
import type { Currency } from '@/lib/clients/core/schemas';
import { useForm } from '@tanstack/react-form';
import { useI18n } from '@/lib/i18n';

export const useAddClientForm = (onSuccess?: () => void) => {
  const { t } = useI18n();
  const { mutateAsync } = useAddClient();

  const form = useForm({
    defaultValues: {
      name: '',
      company: '',
      age: '' as any, // Will be handled as number in the component
      gender: '' as any, // Empty select option
      currency: 'USD' as Currency,
      subscriptionCost: '',
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        // Convert values to proper types for the payload
        const payload = {
          ...value,
          age:
            typeof value.age === 'string'
              ? parseInt(value.age) || 0
              : value.age,
          subscriptionCost: parseFloat(value.subscriptionCost),
        };
        await mutateAsync(payload);
        formApi.reset();
        onSuccess?.();
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: t('clients.toasts.addFormError'),
            fields: {}, // Required by TS
          },
        });
      }
    },
  });

  return { form };
};
