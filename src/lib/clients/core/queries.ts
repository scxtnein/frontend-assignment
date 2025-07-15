import {
  allClientsResponse,
  addClientPayloadSchema,
  type AddClientPayload,
  type Client,
} from '@/lib/clients/core/schemas';
import { kyClient } from '@/shared/core/ky-client';
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { uid } from 'uid/secure';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

export const CLIENT_QUERY_KEYS = {
  all: ['clients'],
} as const;

export const CLIENT_QUERIES = {
  getAllClients: () =>
    queryOptions({
      queryKey: CLIENT_QUERY_KEYS.all,
      queryFn: async () => {
        const response = await kyClient.get('clients').json();

        const { success, data } = allClientsResponse.safeParse(response);
        if (!success) {
          throw new Error('Invalid response from server');
        }

        return data;
      },
    }),
};

export const useAddClient = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return useMutation<Client, Error, AddClientPayload>({
    mutationFn: async (payload: AddClientPayload) => {
      const { success, data } = addClientPayloadSchema.safeParse(payload);
      if (!success) {
        throw new Error('Invalid client data');
      }

      const newClient = {
        id: uid(6),
        ...data,
        picture: 'https://via.placeholder.com/150',
        registered: new Date().toISOString(),
        // Convert number to string for JSON server
        subscriptionCost: data.subscriptionCost.toFixed(2),
      };

      const response = await kyClient
        .post('clients', { json: newClient })
        .json();
      return response as Client;
    },
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      toast.success(
        t('clients.toasts.addSuccess', { clientName: newClient.name }),
      );
    },
    onError: (error) => {
      toast.error(t('clients.toasts.addError', { error: error.message }));
    },
  });
};

export const useEditClient = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return useMutation<Client, Error, Client>({
    mutationFn: async (payload: Client) => {
      const updatedClient = {
        ...payload,
        // Convert number to string for JSON server
        subscriptionCost:
          typeof payload.subscriptionCost === 'number'
            ? payload.subscriptionCost.toFixed(2)
            : payload.subscriptionCost,
      };

      const response = await kyClient
        .put(`clients/${payload.id}`, { json: updatedClient })
        .json();
      return response as Client;
    },
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      toast.success(
        t('clients.toasts.updateSuccess', { clientName: updatedClient.name }),
      );
    },
    onError: (error) => {
      toast.error(t('clients.toasts.updateError', { error: error.message }));
    },
  });
};

export const useDeleteClient = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (clientId: string) => {
      await kyClient.delete(`clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      toast.success(t('clients.toasts.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(t('clients.toasts.deleteError', { error: error.message }));
    },
  });
};
