import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import moviesRouter from './routes/movies';
import showtimesRouter from './routes/showtimes';
import seatsRouter from './routes/seats';
import bookingsRouter from './routes/bookings';
import authRouter from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);
app.use('/api/showtimes', showtimesRouter);
app.use('/api/seats', seatsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/auth', authRouter);

export default app;
