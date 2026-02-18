import db from './db';
import bcrypt from 'bcryptjs';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: seed.ts must not be run in production');
  process.exit(1);
}

// Clear existing data
db.exec('DELETE FROM bookings');
db.exec('DELETE FROM seats');
db.exec('DELETE FROM showtimes');
db.exec('DELETE FROM movies');
db.exec('DELETE FROM users');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('bookings','seats','showtimes','movies','users')");

// Seed users — passwords are hashed (bcrypt, cost 10)
const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
const seedPassword = bcrypt.hashSync('password123', 10);
insertUser.run('John Doe', 'john@example.com', seedPassword);
insertUser.run('Jane Smith', 'jane@example.com', seedPassword);
insertUser.run('Raj Patel', 'raj@example.com', seedPassword);

// Seed movies - real movies with TMDB poster URLs
const insertMovie = db.prepare(`
  INSERT INTO movies (title, genre, duration, rating, poster_url, synopsis, director, cast_members, release_date, language)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const movies = [
  {
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/frq4ygwcIMusECNv9rPBrvJwyxG.jpg',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
    releaseDate: '2010-07-16',
    language: 'English'
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    duration: 152,
    rating: 9.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/eMaH8xS0vXae1jm1Ry0S3yRBEhM.jpg',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine',
    releaseDate: '2008-07-18',
    language: 'English'
  },
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    duration: 169,
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft along with a team of researchers to find a new planet for humans.',
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    releaseDate: '2014-11-07',
    language: 'English'
  },
  {
    title: 'Oppenheimer',
    genre: 'Drama',
    duration: 180,
    rating: 8.5,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    releaseDate: '2023-07-21',
    language: 'English'
  },
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    duration: 166,
    rating: 8.6,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3HzGtM0JpfH2pWFGugJK22LRP6b.jpg',
    synopsis: 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
    director: 'Denis Villeneuve',
    cast: 'Timothee Chalamet, Zendaya, Austin Butler, Florence Pugh',
    releaseDate: '2024-03-01',
    language: 'English'
  },
  {
    title: 'Parasite',
    genre: 'Thriller',
    duration: 132,
    rating: 8.5,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    releaseDate: '2019-05-30',
    language: 'Korean'
  },
  {
    title: 'The Shawshank Redemption',
    genre: 'Drama',
    duration: 142,
    rating: 9.3,
    posterUrl: 'https://image.tmdb.org/t/p/w500/u5hLebzUOBGbnPikIyxI1159lhc.jpg',
    synopsis: 'Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion.',
    director: 'Frank Darabont',
    cast: 'Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler',
    releaseDate: '1994-09-23',
    language: 'English'
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Animation',
    duration: 140,
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    synopsis: 'Miles Morales catapults across the multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    director: 'Joaquim Dos Santos',
    cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac, Jake Johnson',
    releaseDate: '2023-06-02',
    language: 'English'
  },
  {
    title: 'Everything Everywhere All at Once',
    genre: 'Sci-Fi',
    duration: 139,
    rating: 8.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    synopsis: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.',
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: 'Michelle Yeoh, Stephanie Hsu, Ke Huy Quan, Jamie Lee Curtis',
    releaseDate: '2022-03-25',
    language: 'English'
  },
  {
    title: 'John Wick: Chapter 4',
    genre: 'Action',
    duration: 169,
    rating: 7.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/nDgdwogUC1JFhgZk9deYYedjqoi.jpg',
    synopsis: 'John Wick uncovers a path to defeating the High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',
    director: 'Chad Stahelski',
    cast: 'Keanu Reeves, Donnie Yen, Bill Skarsgard, Laurence Fishburne',
    releaseDate: '2023-03-24',
    language: 'English'
  },
  {
    title: 'Barbie',
    genre: 'Comedy',
    duration: 114,
    rating: 7.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    synopsis: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.',
    director: 'Greta Gerwig',
    cast: 'Margot Robbie, Ryan Gosling, America Ferrera, Will Ferrell',
    releaseDate: '2023-07-21',
    language: 'English'
  },
  {
    title: 'RRR',
    genre: 'Action',
    duration: 187,
    rating: 7.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/tjpiEnZBUAA8pdNPRKa5vP2Zpqw.jpg',
    synopsis: 'A fictitious story about two legendary revolutionaries and their journey away from home before they began fighting for their country in the 1920s.',
    director: 'S.S. Rajamouli',
    cast: 'N.T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt',
    releaseDate: '2022-03-25',
    language: 'Telugu'
  },
  {
    title: 'The Batman',
    genre: 'Action',
    duration: 176,
    rating: 7.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    director: 'Matt Reeves',
    cast: 'Robert Pattinson, Zoe Kravitz, Paul Dano, Jeffrey Wright',
    releaseDate: '2022-03-04',
    language: 'English'
  },
  {
    title: 'Top Gun: Maverick',
    genre: 'Action',
    duration: 130,
    rating: 8.3,
    posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    synopsis: 'After thirty years of service as one of the Navy\'s top aviators, Pete "Maverick" Mitchell is where he belongs, pushing the envelope as a courageous test pilot.',
    director: 'Joseph Kosinski',
    cast: 'Tom Cruise, Miles Teller, Jennifer Connelly, Jon Hamm',
    releaseDate: '2022-05-27',
    language: 'English'
  },
  {
    title: 'Jawan',
    genre: 'Action',
    duration: 169,
    rating: 7.1,
    posterUrl: 'https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg',
    synopsis: 'A man is driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago. He comes up against a ruthless arms dealer who threatens the security of the nation.',
    director: 'Atlee',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone',
    releaseDate: '2023-09-07',
    language: 'Hindi'
  },
  {
    title: 'Poor Things',
    genre: 'Comedy',
    duration: 141,
    rating: 8.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    synopsis: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.',
    director: 'Yorgos Lanthimos',
    cast: 'Emma Stone, Mark Ruffalo, Willem Dafoe, Ramy Youssef',
    releaseDate: '2023-12-08',
    language: 'English'
  },
  {
    title: 'Killers of the Flower Moon',
    genre: 'Drama',
    duration: 206,
    rating: 7.6,
    posterUrl: 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
    synopsis: 'Members of the Osage tribe in the United States are murdered under mysterious circumstances in the 1920s, sparking a major FBI investigation involving J. Edgar Hoover.',
    director: 'Martin Scorsese',
    cast: 'Leonardo DiCaprio, Robert De Niro, Lily Gladstone, Jesse Plemons',
    releaseDate: '2023-10-20',
    language: 'English'
  },
  {
    title: 'Guardians of the Galaxy Vol. 3',
    genre: 'Action',
    duration: 150,
    rating: 8.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
    synopsis: 'Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own. A mission that could mean the end of the Guardians if not successful.',
    director: 'James Gunn',
    cast: 'Chris Pratt, Zoe Saldana, Dave Bautista, Karen Gillan',
    releaseDate: '2023-05-05',
    language: 'English'
  },
  {
    title: 'The Whale',
    genre: 'Drama',
    duration: 117,
    rating: 7.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/jQ0gylJMxWSL490sy0RrPj1Lj7e.jpg',
    synopsis: 'A reclusive English teacher suffering from severe obesity attempts to reconnect with his estranged teenage daughter for one last chance at redemption.',
    director: 'Darren Aronofsky',
    cast: 'Brendan Fraser, Sadie Sink, Hong Chau, Ty Simpkins',
    releaseDate: '2022-12-09',
    language: 'English'
  },
  {
    title: '12th Fail',
    genre: 'Drama',
    duration: 147,
    rating: 8.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/acB0GpkpS0GHOjdvuVizYT7GlE7.jpg',
    synopsis: 'The real-life story of IPS officer Manoj Kumar Sharma who rose from a humble background in Chambal to crack one of the toughest examinations in India.',
    director: 'Vidhu Vinod Chopra',
    cast: 'Vikrant Massey, Medha Shankar, Anant Joshi',
    releaseDate: '2023-10-27',
    language: 'Hindi'
  },
  {
    title: 'Godzilla Minus One',
    genre: 'Sci-Fi',
    duration: 124,
    rating: 7.9,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5kEcLS8CQ3t07PqaHglU3ZJBfWV.jpg',
    synopsis: 'In postwar Japan, a traumatized former fighter pilot joins the civilian effort to fight off a giant monster that is attacking the country.',
    director: 'Takashi Yamazaki',
    cast: 'Ryunosuke Kamiki, Minami Hamabe, Yuki Yamada',
    releaseDate: '2023-11-03',
    language: 'Japanese'
  },
  {
    title: 'Past Lives',
    genre: 'Romance',
    duration: 105,
    rating: 8.0,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wR81veZrj79VOr2mHGwUOoHmL0g.jpg',
    synopsis: 'Two deeply connected childhood friends are separated after one family emigrates from South Korea. Twenty years later, they are reunited in New York for one fateful week.',
    director: 'Celine Song',
    cast: 'Greta Lee, Teo Yoo, John Magaro',
    releaseDate: '2023-06-02',
    language: 'English'
  },
  {
    title: 'Animal',
    genre: 'Thriller',
    duration: 201,
    rating: 6.5,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hr9rjR3J0xBBKmlJ4n3gHId9ccx.jpg',
    synopsis: 'A son undergoes a remarkable transformation as the bond with his father is tested by secrets, betrayals, and the pursuit of power in the family business.',
    director: 'Sandeep Reddy Vanga',
    cast: 'Ranbir Kapoor, Anil Kapoor, Bobby Deol, Rashmika Mandanna',
    releaseDate: '2023-12-01',
    language: 'Hindi'
  },
  {
    title: 'The Holdovers',
    genre: 'Comedy',
    duration: 133,
    rating: 7.9,
    posterUrl: 'https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg',
    synopsis: 'A cranky teacher at a New England prep school is forced to remain on campus during Christmas break to babysit the handful of students with nowhere to go.',
    director: 'Alexander Payne',
    cast: 'Paul Giamatti, Da\'Vine Joy Randolph, Dominic Sessa',
    releaseDate: '2023-10-27',
    language: 'English'
  },
  // This movie intentionally has NULL fields to trigger crashes on detail page
  {
    title: 'Untitled Project X',
    genre: 'Mystery',
    duration: 95,
    rating: null as any,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wwemzKWzjKYJFfCeiB57q3r4Bcm.jpg',
    synopsis: null as any,
    director: 'TBA',
    cast: null as any,
    releaseDate: '2026-06-01',
    language: 'English'
  }
];

for (const m of movies) {
  insertMovie.run(m.title, m.genre, m.duration, m.rating, m.posterUrl, m.synopsis, m.director, m.cast, m.releaseDate, m.language);
}

// Seed showtimes - more variety
const insertShowtime = db.prepare(`
  INSERT INTO showtimes (movie_id, date, time, venue, price, total_seats)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const venues = [
  'INOX Megaplex - Screen 1',
  'INOX Megaplex - Screen 2',
  'INOX Megaplex - IMAX',
  'PVR Luxe - Orion Mall',
  'PVR Luxe - Phoenix Mall',
  'PVR IMAX - Forum Mall',
  'Cinepolis - Lulu Mall',
  'Cinepolis - VR Mall',
  'Regal Cinemas - MG Road',
  'Miraj Cinemas - Mantri Square'
];

const times = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM', '7:30 PM', '9:00 PM', '10:30 PM', '11:45 PM'];
const dates = ['2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23', '2026-02-24', '2026-02-25'];
const prices = [150, 180, 200, 250, 280, 300, 350, 400, 450, 500, 550, 650];

for (let movieId = 1; movieId <= movies.length; movieId++) {
  for (const date of dates) {
    // Each movie gets 3-6 shows per day across different venues
    const numShows = 3 + Math.floor(Math.random() * 4);
    const shuffledTimes = [...times].sort(() => Math.random() - 0.5).slice(0, numShows);
    const shuffledVenues = [...venues].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledTimes.length; i++) {
      const venue = shuffledVenues[i % shuffledVenues.length];
      const price = prices[Math.floor(Math.random() * prices.length)];
      const totalSeats = venue.includes('IMAX') ? 120 : 80;
      insertShowtime.run(movieId, date, shuffledTimes[i], venue, price, totalSeats);
    }
  }
}

// Seed seats for each showtime
const allShowtimes = db.prepare('SELECT id, total_seats FROM showtimes').all() as { id: number; total_seats: number }[];
const insertSeat = db.prepare('INSERT INTO seats (showtime_id, row, number, is_booked) VALUES (?, ?, ?, ?)');

const rowsSmall = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rowsIMAX = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const insertSeats = db.transaction(() => {
  for (const showtime of allShowtimes) {
    const rows = showtime.total_seats > 80 ? rowsIMAX : rowsSmall;
    const seatsPerRow = 10;
    for (const row of rows) {
      for (let num = 1; num <= seatsPerRow; num++) {
        // Randomly book 15-35% of seats
        const bookingRate = 0.15 + Math.random() * 0.2;
        const isBooked = Math.random() < bookingRate ? 1 : 0;
        insertSeat.run(showtime.id, row, num, isBooked);
      }
    }
  }
});

insertSeats();

// Seed multiple bookings for user 1 (John) to make My Bookings page interesting
const insertBooking = db.prepare(`
  INSERT INTO bookings (user_id, showtime_id, seats, total_amount, booking_date)
  VALUES (?, ?, ?, ?, ?)
`);
insertBooking.run(1, 1, 'A1,A2,A3', 900, '2026-02-15T10:30:00');
insertBooking.run(1, 5, 'D4,D5', 700, '2026-02-16T14:20:00');
insertBooking.run(1, 12, 'F7,F8,F9,F10', 2000, '2026-02-17T09:00:00');
insertBooking.run(1, 20, 'B3', 350, '2026-02-18T11:45:00');

// Some bookings for user 2 (Jane)
insertBooking.run(2, 3, 'C5,C6', 600, '2026-02-17T16:00:00');
insertBooking.run(2, 8, 'G1,G2,G3', 1050, '2026-02-18T08:30:00');

const showtimeCount = allShowtimes.length;
const totalSeats = allShowtimes.reduce((sum, s) => {
  const rows = s.total_seats > 80 ? 12 : 8;
  return sum + rows * 10;
}, 0);

console.log('Database seeded successfully!');
console.log(`- ${movies.length} movies`);
console.log(`- ${showtimeCount} showtimes`);
console.log(`- ${totalSeats} seats`);
console.log('- 3 users');
console.log('- 6 bookings');
