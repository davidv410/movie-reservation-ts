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
    genreIds: z.array(z.uuid()).min(1, "At least one genre is required")
});

export const updateMovieSchema = createMovieSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const paramsSchema = z.object({
  id: z.uuid("Invalid id")
});

export const createShowtimeSchema = z.object({
  movieId: z.uuid(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  hall: z.string().min(1),
  totalSeats: z.number().int().positive(),
});

export const updateShowtimeSchema = createShowtimeSchema.partial()

export const querySchema = z.object({
  date: z.string().date("Invalid date format").optional(),
  movieId: z.uuid().optional(),
});

export const createReservationSchema = z.object({
  showtimeId: z.uuid(),
  seatId: z.uuid(),
});

export type registerSchemaBody = z.infer<typeof registerSchema>
export type loginSchemaBody = z.infer<typeof loginSchema>
export type createMovieBody = z.infer<typeof createMovieSchema>
export type updateMovieBody = z.infer<typeof updateMovieSchema>
export type createShowtimeBody = z.infer<typeof createShowtimeSchema>
export type updateShowtimeBody = z.infer<typeof updateShowtimeSchema>
export type createReservationBody = z.infer<typeof createReservationSchema>