export const CURRENCY_OPTIONS = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  SGD: 'SGD',
  INR: 'INR',
  JPY: 'JPY',
};
export type CurrencyOptions =
  (typeof CURRENCY_OPTIONS)[keyof typeof CURRENCY_OPTIONS];

export const CURRENCIES = {
  ...CURRENCY_OPTIONS,
  YEN: 'Yen', // Malformed prefer JPY, kept for compatibility with existing data
} as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;
