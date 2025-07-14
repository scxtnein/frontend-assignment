import { createFileRoute, redirect } from '@tanstack/react-router';

import { SignupPage } from '@/lib/auth/pages/signup.page';

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: SignupPage,
});
