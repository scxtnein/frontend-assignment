import { useId, useState } from 'react';
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  UserPlusIcon,
  SquircleIcon,
} from 'lucide-react';

import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/lib/i18n';

import { useSignupForm } from './use-signup-form';

const checkStrength = (pass: string, t: any) => {
  const requirements = [
    { regex: /.{8,}/, text: t('auth.passwordChecks.atLeast8') },
    { regex: /[0-9]/, text: t('auth.passwordChecks.atLeast1Number') },
    { regex: /[A-Z]/, text: t('auth.passwordChecks.atLeast1Uppercase') },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));
};

const getStrengthColor = (score: number) => {
  if (score === 0) return 'bg-border';
  if (score === 1) return 'bg-red-500';
  if (score === 2) return 'bg-amber-500';
  return 'bg-green-600';
};

export const SignupForm = () => {
  const { t } = useI18n();
  const { form } = useSignupForm();
  const passwordId = useId();
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prevState) => !prevState);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className='flex flex-col gap-6'>
        <>
          <div className='grid gap-3'>
            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  if (!value) return t('auth.validation.nameRequired');
                  if (value.length < 2)
                    return t('auth.validation.nameMinLength');
                  return undefined;
                },
              }}
            >
              {(field) => (
                <>
                  <Label htmlFor={field.name}>{t('auth.name')}</Label>
                  <Input
                    type='text'
                    placeholder={t('auth.namePlaceholder')}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span
                      id={`${field.name}-error`}
                      className='text-xs text-destructive -mt-1'
                    >
                      {field.state.meta.errors[0]}
                    </span>
                  )}
                </>
              )}
            </form.Field>
          </div>
          <div className='grid gap-3'>
            <form.Field
              name='email'
              validators={{
                onChange: ({ value }) => {
                  if (!value) return t('auth.validation.emailRequired');
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return t('auth.validation.emailInvalid');
                  }
                  return undefined;
                },
              }}
            >
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
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                    aria-describedby={
                      field.state.meta.errors.length > 0
                        ? `${field.name}-error`
                        : undefined
                    }
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span
                      id={`${field.name}-error`}
                      className='text-xs text-destructive -mt-1'
                    >
                      {field.state.meta.errors[0]}
                    </span>
                  )}
                </>
              )}
            </form.Field>
          </div>
          <div className='grid gap-3'>
            <form.Field
              name='password'
              validators={{
                onChange: ({ value }) => {
                  if (!value) return t('auth.validation.passwordRequired');
                  const strength = checkStrength(value, t);
                  const unmetRequirements = strength.filter((req) => !req.met);
                  if (unmetRequirements.length > 0) {
                    return t('auth.validation.passwordMustMeet');
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const strength = checkStrength(field.state.value, t);
                const strengthScore = strength.filter((req) => req.met).length;

                return (
                  <>
                    <Label htmlFor={passwordId}>{t('auth.password')}</Label>
                    <div className='relative'>
                      <Input
                        id={passwordId}
                        placeholder={t('auth.passwordPlaceholder')}
                        type={showPassword ? 'text' : 'password'}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-describedby={`${passwordId}-description`}
                        aria-invalid={field.state.meta.errors.length > 0}
                        className='pr-10'
                      />
                      <button
                        className='text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                        type='button'
                        onClick={toggleVisibility}
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

                    {/* Password strength indicator */}
                    <div
                      className='bg-border  h-1 w-full overflow-hidden rounded-full'
                      role='progressbar'
                      aria-valuenow={strengthScore}
                      aria-valuemin={0}
                      aria-valuemax={3}
                      aria-label={t('auth.passwordStrength')}
                    >
                      <div
                        className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                        style={{ width: `${(strengthScore / 3) * 100}%` }}
                      ></div>
                    </div>

                    {/* Password requirements list */}
                    <ul
                      className='space-y-1.5'
                      aria-label={t('auth.passwordRequirements')}
                    >
                      {strength.map((req, index) => (
                        <li key={index} className='flex items-center gap-2'>
                          {req.met ? (
                            <CheckIcon
                              size={16}
                              className='text-accent-foreground'
                              aria-hidden='true'
                            />
                          ) : (
                            <SquircleIcon
                              size={16}
                              className='text-muted-foreground/60'
                              aria-hidden='true'
                            />
                          )}
                          <span
                            className={`text-xs ${req.met ? 'text-accent-foreground' : 'text-muted-foreground/60'}`}
                          >
                            {req.text}
                            <span className='sr-only'>
                              {req.met
                                ? ` - ${t('auth.requirementMet')}`
                                : ` - ${t('auth.requirementNotMet')}`}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              }}
            </form.Field>
          </div>
        </>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type='submit' className='w-full' disabled={!canSubmit}>
              <UserPlusIcon className='size-4' />
              <span
                className={`transition-opacity ${
                  isSubmitting ? 'opacity-70' : 'opacity-100'
                }`}
              >
                {t('auth.signUp')}
              </span>
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};
