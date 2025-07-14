import { createFileRoute, redirect } from '@tanstack/react-router';

import { z } from 'zod/v4';

import { LoginPage } from '@/lib/auth/pages/login.page';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || '/' });
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  component: LoginPage,
});
