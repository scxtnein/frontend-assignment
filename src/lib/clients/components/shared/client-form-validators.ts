import { ageSchema } from '@/lib/clients/core/schemas';

export const clientFormValidators = {
  name: {
    onChange: ({ value }: { value: string }) => {
      if (!value) return 'Name is required';
      if (value.length < 2) return 'Name must be at least 2 characters';
      return undefined;
    },
  },

  company: {
    onChange: ({ value }: { value: string }) => {
      if (!value) return 'Company is required';
      return undefined;
    },
  },

  age: {
    onSubmit: ageSchema,
  },

  gender: {
    onChange: ({ value }: { value: string }) => {
      if (!value || value === '') return 'Gender is required';
      return undefined;
    },
    onBlur: ({ value }: { value: string }) => {
      if (!value || value === '') return 'Gender is required';
      return undefined;
    },
    onSubmit: ({ value }: { value: string }) => {
      if (!value || value === '') return 'Gender is required';
      return undefined;
    },
  },

  currency: {
    onChange: ({ value }: { value: string }) => {
      if (!value) return 'Currency is required';
      return undefined;
    },
  },

  subscriptionCost: {
    onChange: ({ value }: { value: string }) => {
      if (!value) return 'Subscription cost is required';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Must be a valid positive number';
      return undefined;
    },
    onBlur: ({ value }: { value: string }) => {
      if (!value) return 'Subscription cost is required';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Must be a valid positive number';
      return undefined;
    },
    onSubmit: ({ value }: { value: string }) => {
      if (!value) return 'Subscription cost is required';
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Must be a valid positive number';
      return undefined;
    },
  },
};
