import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
  csrfToken: z.string().optional()
});

export const playlistCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  is_public: z.boolean().optional(),
});
