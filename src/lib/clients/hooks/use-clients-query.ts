import { CLIENT_QUERIES } from '@/lib/clients/core/queries';
import { useQuery } from '@tanstack/react-query';

export const useClientsQuery = () => {
  return useQuery(CLIENT_QUERIES.getAllClients());
};
