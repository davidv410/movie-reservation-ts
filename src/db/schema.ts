import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  serial
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


export const rolesEnum = pgEnum('roles', ["admin", "user"])

export const reservationStatusEnum = pgEnum("reservation_status", [
  "confirmed",
  "cancelled",
]);
 
export const seatTypeEnum = pgEnum("seat_type", [
  "standard",
  "premium",
  "accessible",
]);


export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: rolesEnum('role').notNull().default("user"),
    createdAt: timestamp('created_at').defaultNow(),
    refreshToken: varchar('refresh_token', { length: 500 })
})

 
export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});
 
export const movies = pgTable(
  "movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    posterUrl: varchar("poster_url", { length: 500 }),
    durationMinutes: integer("duration_minutes").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    titleIdx: index("movies_title_idx").on(t.title),
    activeIdx: index("movies_active_idx").on(t.isActive),
  })
);
 
export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: uniqueIndex("movie_genres_pk").on(t.movieId, t.genreId),
  })
);
 
export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    hall: varchar("hall", { length: 50 }).notNull(), // e.g. "Hall A", "Screen 3"
    totalSeats: integer("total_seats").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    movieIdx: index("showtimes_movie_idx").on(t.movieId),
    startsAtIdx: index("showtimes_starts_at_idx").on(t.startsAt),
    // Useful for the "browse by date" query
    movieDateIdx: index("showtimes_movie_date_idx").on(t.movieId, t.startsAt),
  })
);
 
export const seats = pgTable(
  "seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    row: varchar("row", { length: 5 }).notNull(),   // e.g. "A", "B", "C"
    number: integer("number").notNull(),             // e.g. 1, 2, 3
    type: seatTypeEnum("type").notNull().default("standard"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
  },
  (t) => ({
    // Enforce unique seat position per showtime
    uniqueSeat: uniqueIndex("seats_showtime_row_number_idx").on(
      t.showtimeId,
      t.row,
      t.number
    ),
    showtimeIdx: index("seats_showtime_idx").on(t.showtimeId),
    availableIdx: index("seats_available_idx").on(t.showtimeId, t.isAvailable),
  })
);
 
export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    seatId: uuid("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    status: reservationStatusEnum("status").notNull().default("confirmed"),
    // Snapshot the price at time of booking — don't rely on seats.price later
    pricePaid: decimal("price_paid", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at"),
  },
  (t) => ({
    // One reservation per seat per showtime (prevents double-booking)
    uniqueBooking: uniqueIndex("reservations_seat_unique_idx").on(
      t.seatId,
      t.showtimeId
    ),
    userIdx: index("reservations_user_idx").on(t.userId),
    showtimeIdx: index("reservations_showtime_idx").on(t.showtimeId),
    statusIdx: index("reservations_status_idx").on(t.status),
  })
);
 
export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));
 
export const genresRelations = relations(genres, ({ many }) => ({
  movieGenres: many(movieGenres),
}));
 
export const moviesRelations = relations(movies, ({ many }) => ({
  movieGenres: many(movieGenres),
  showtimes: many(showtimes),
}));
 
export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, { fields: [movieGenres.movieId], references: [movies.id] }),
  genre: one(genres, { fields: [movieGenres.genreId], references: [genres.id] }),
}));
 
export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, { fields: [showtimes.movieId], references: [movies.id] }),
  seats: many(seats),
  reservations: many(reservations),
}));
 
export const seatsRelations = relations(seats, ({ one, many }) => ({
  showtime: one(showtimes, { fields: [seats.showtimeId], references: [showtimes.id] }),
  reservations: many(reservations),
}));
 
export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  showtime: one(showtimes, { fields: [reservations.showtimeId], references: [showtimes.id] }),
  seat: one(seats, { fields: [reservations.seatId], references: [seats.id] }),
}));
