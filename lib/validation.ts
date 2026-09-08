import { z } from "zod";
export const emailSchema = z.email().trim().toLowerCase().max(254);
export const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "Enter the code from your email.");
export const ideaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your idea a title.")
    .max(120, "Keep the title under 121 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2,001 characters."),
});
export const idSchema = z.uuid();
export type FormState = { error?: string; success?: string; email?: string };
