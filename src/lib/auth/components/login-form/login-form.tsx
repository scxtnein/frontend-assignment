import { useState } from 'react';

import { LogInIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useI18n } from '@/lib/i18n';

import { useLoginForm } from './use-login-form';

export const LoginForm = () => {
  const { t } = useI18n();
  const { form } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className='flex flex-col gap-6'>
        <form.Subscribe
          selector={(state) => [state.isFormValid, state.errors.length > 0]}
        >
          {([isFormValid, hasError]) => {
            const isInvalid = isFormValid ? false : hasError;
            return (
              <>
                <div className='grid gap-3'>
                  <form.Field name='email'>
                    {(field) => (
                      <>
                        <Label htmlFor={field.name}>{t('auth.email')}</Label>
                        <Input
                          type='email'
                          placeholder={t('auth.emailPlaceholder')}
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className='grid gap-3'>
                  <form.Field name='password'>
                    {(field) => {
                      return (
                        <>
                          <Label htmlFor='password'>{t('auth.password')}</Label>
                          <div className='relative'>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder={t('auth.passwordPlaceholder')}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              className='pr-10'
                            />

                            <button
                              className='text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer'
                              type='button'
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword
                                  ? t('auth.hidePassword')
                                  : t('auth.showPassword')
                              }
                              aria-pressed={showPassword}
                              aria-controls='password'
                            >
                              {showPassword ? (
                                <EyeOffIcon size={16} aria-hidden='true' />
                              ) : (
                                <EyeIcon size={16} aria-hidden='true' />
                              )}
                            </button>
                          </div>
                        </>
                      );
                    }}
                  </form.Field>
                </div>
              </>
            );
          }}
        </form.Subscribe>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type='submit' className='w-full' disabled={!canSubmit}>
              <LogInIcon className='size-4' />
              <span
                className={`transition-opacity ${
                  isSubmitting ? 'opacity-70' : 'opacity-100'
                }`}
              >
                {t('auth.login')}
              </span>
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
