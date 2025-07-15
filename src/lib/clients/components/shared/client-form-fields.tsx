import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { CURRENCY_OPTIONS, GENDER_OPTIONS } from '@/shared/core/constants';
import { clientFormValidators } from './client-form-validators';

interface ClientFormFieldsProps {
  form: any; // TanStack Form instance
}

export const ClientFormFields = ({ form }: ClientFormFieldsProps) => {
  const { t } = useI18n();

  return (
    <div className='flex flex-col gap-6'>
      {/* Name Field */}
      <div className='grid gap-3'>
        <form.Field name='name' validators={clientFormValidators.name}>
          {(field: any) => (
            <>
              <Label htmlFor={field.name}>{t('common.name')}</Label>
              <Input
                type='text'
                placeholder={t('clients.form.placeholders.name')}
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

      {/* Company Field */}
      <div className='grid gap-3'>
        <form.Field name='company' validators={clientFormValidators.company}>
          {(field: any) => (
            <>
              <Label htmlFor={field.name}>{t('common.company')}</Label>
              <Input
                type='text'
                placeholder={t('clients.form.placeholders.company')}
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

      {/* Age & Gender Fields */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Age Field */}
        <div className='grid gap-3'>
          <form.Field name='age' validators={clientFormValidators.age}>
            {(field: any) => (
              <>
                <Label htmlFor={field.name}>{t('clients.form.age')}</Label>
                <Input
                  type='number'
                  placeholder={t('clients.form.placeholders.age')}
                  id={field.name}
                  name={field.name}
                  min={18}
                  max={100}
                  value={field.state.value || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(
                      value === '' ? '' : parseInt(value) || value,
                    );
                  }}
                  onBlur={field.handleBlur}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={
                    field.state.meta.errors.length > 0
                      ? `${field.name}-error`
                      : undefined
                  }
                />
              </>
            )}
          </form.Field>
        </div>

        {/* Gender Field */}
        <div className='grid gap-3'>
          <form.Field name='gender' validators={clientFormValidators.gender}>
            {(field: any) => (
              <>
                <Label htmlFor={field.name}>{t('clients.form.gender')}</Label>
                <Select
                  value={field.state.value || ''}
                  onValueChange={(value: 'male' | 'female') =>
                    field.handleChange(value)
                  }
                >
                  <SelectTrigger id={field.name} className='w-full'>
                    <SelectValue
                      placeholder={t('clients.form.placeholders.gender')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {t(`clients.form.genderOptions.${gender.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </form.Field>
        </div>
      </div>

      {/* Subscription Cost with Currency Field */}
      <div className='grid gap-3'>
        <Label htmlFor='subscriptionCost'>
          {t('clients.form.subscriptionCost')}
        </Label>
        <div className='flex rounded-md shadow-sm'>
          <form.Field
            name='currency'
            validators={clientFormValidators.currency}
          >
            {(field: any) => (
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val)}
              >
                <SelectTrigger className='w-32 rounded-e-none border-r-0'>
                  <SelectValue
                    placeholder={t('clients.form.placeholders.currency')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCY_OPTIONS).map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
          <form.Field
            name='subscriptionCost'
            validators={clientFormValidators.subscriptionCost}
          >
            {(field: any) => (
              <>
                <Input
                  type='text'
                  id='subscriptionCost'
                  name={field.name}
                  className='rounded-s-none focus-visible:z-10'
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
              </>
            )}
          </form.Field>
        </div>
        <form.Field name='subscriptionCost'>
          {(field: any) => (
            <>
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
    </div>
  );
};
