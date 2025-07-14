import { ClientsPage } from '@/lib/clients/pages/clients.page';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      const href = location.href;
      throw redirect({
        to: '/login',
        search: {
          redirect: href === '/' ? undefined : href,
        },
      });
    }
  },
  component: ClientsPage,
});
