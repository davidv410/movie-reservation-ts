import { z } from "zod/v4";

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
    password: z.string().min(8, 'Password must be 8 characters or more')
})

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required')
})

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  posterUrl: z.string().url("Invalid URL").optional(),
  durationMinutes: z.number().int().positive("Duration must be a positive number"),
});

export const updateMovieSchema = createMovieSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const paramsSchema = z.object({
  id: z.uuid("Invalid movie id")
});

export type registerSchemaBody = z.infer<typeof registerSchema>
export type loginSchemaBody = z.infer<typeof loginSchema>
export type createMovieBody = z.infer<typeof createMovieSchema>
export type updateMovieBody = z.infer<typeof updateMovieSchema>