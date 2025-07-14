import { CURRENCIES } from '@/shared/core/constants';
import { z } from 'zod/v4';

const currencySchema = z.union(
  Object.values(CURRENCIES).map((currency) => z.literal(currency)),
);
export type Currency = z.infer<typeof currencySchema>;

// Simple normalization for the Yen fluke
export const normalizeCurrency = (currency: Currency): string => {
  return currency === 'Yen' ? 'JPY' : currency;
};

const subscriptionCostSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number().positive());

export const clientSchema = z.object({
  id: z.string(),
  gender: z.union([z.literal('male'), z.literal('female')]),
  name: z.string(),
  company: z.string(),
  age: z.number(),
  picture: z.string(),
  registered: z.string(),
  currency: currencySchema,
  subscriptionCost: subscriptionCostSchema,
});
export type Client = z.infer<typeof clientSchema>;

export const ageSchema = z
  .number()
  .int()
  .min(18, 'Age must be at least 18')
  .max(100, 'Age must be at most 100');

export const addClientPayloadSchema = z.object({
  name: z
    .string()
    .nonempty('Name is required')
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  company: z.string().min(1, 'Company is required'),
  age: ageSchema,
  gender: z.union([z.literal('male'), z.literal('female')]),
  currency: z.union(
    Object.values(CURRENCIES).map((currency) => z.literal(currency)),
  ),
  subscriptionCost: z.number().positive('Invalid subscription cost'),
});
export type AddClientPayload = z.infer<typeof addClientPayloadSchema>;

export const allClientsResponse = clientSchema.array();
export type AllClientsResponse = z.infer<typeof allClientsResponse>;
