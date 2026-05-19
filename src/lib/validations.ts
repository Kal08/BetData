import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscore only"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "USER"]),
});

export const entrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  system: z.coerce.number().finite(),
  online: z.coerce.number().finite(),
  number: z.coerce.number().finite().optional().default(0),
  bonus: z.coerce.number().finite(),
  win: z.coerce.number().finite(),
  cash: z.coerce.number().finite(),
  note: z.string().max(2000).optional().nullable(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export const patchUserSchema = z
  .object({
    canEditEntries: z.boolean().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.canEditEntries !== undefined || data.password !== undefined,
    { message: "No valid fields to update" }
  );

export type EntryInput = z.infer<typeof entrySchema>;
export type PatchUserInput = z.infer<typeof patchUserSchema>;
