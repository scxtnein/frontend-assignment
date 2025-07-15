import { useEditClient } from '@/lib/clients/core/queries';
import type { Client, Currency } from '@/lib/clients/core/schemas';
import { useForm } from '@tanstack/react-form';
import { useI18n } from '@/lib/i18n';

export const useEditClientForm = (client: Client, onSuccess?: () => void) => {
  const { t } = useI18n();
  const { mutateAsync } = useEditClient();

  const form = useForm({
    defaultValues: {
      name: client.name,
      company: client.company,
      age: client.age as any, // Will be handled as number in the component
      gender: client.gender as any, // male | female
      currency: client.currency as Currency,
      subscriptionCost: client.subscriptionCost.toString(),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        // Convert values to proper types for the payload
        const payload = {
          ...client, // Keep all existing fields
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
            form: t('clients.toasts.updateFormError'),
            fields: {}, // Required by TS
          },
        });
      }
    },
  });

  return { form };
};
