import { z } from 'zod';

const passwordSchema = z.string();

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: passwordSchema,
});
export type User = z.infer<typeof userSchema>;

export const loginPayloadSchema = z.object({
  email: z.string(),
  password: passwordSchema,
});
export type LoginPayload = z.infer<typeof loginPayloadSchema>;

export const signupPayloadSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: passwordSchema,
});
export type SignupPayload = z.infer<typeof signupPayloadSchema>;
