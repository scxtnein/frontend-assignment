import { useDeleteClient } from '@/lib/clients/core/queries';
import { useState } from 'react';

export const useDeleteClientDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending } = useDeleteClient();

  const handleDelete = async (clientId: string) => {
    try {
      await mutateAsync(clientId);
      setIsOpen(false);
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  return {
    isOpen,
    setIsOpen,
    handleDelete,
    isPending,
  };
};
