export interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number; // minutes
  rating: number;
  posterUrl: string;
  synopsis: string;
  director: string;
  cast: string;
  releaseDate: string;
  language: string;
}

export interface Showtime {
  id: number;
  movieId: number;
  date: string;
  time: string;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface Seat {
  id: number;
  showtimeId: number;
  row: string;
  number: number;
  isBooked: boolean;
}

export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  seats: string; // comma-separated seat IDs
  totalAmount: number;
  bookingDate: string;
  movieTitle?: string;
  venue?: string;
  showDate?: string;
  showTime?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
