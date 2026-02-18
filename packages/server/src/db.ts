import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'stagepass.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    duration INTEGER NOT NULL,
    rating REAL,
    poster_url TEXT,
    synopsis TEXT,
    director TEXT,
    cast_members TEXT,
    release_date TEXT,
    language TEXT DEFAULT 'English'
  );

  CREATE TABLE IF NOT EXISTS showtimes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    price REAL NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 80,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  );

  CREATE TABLE IF NOT EXISTS seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    showtime_id INTEGER NOT NULL,
    row TEXT NOT NULL,
    number INTEGER NOT NULL,
    is_booked INTEGER DEFAULT 0,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    showtime_id INTEGER NOT NULL,
    seats TEXT NOT NULL,
    total_amount REAL NOT NULL,
    booking_date TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
  );
`);

export default db;
