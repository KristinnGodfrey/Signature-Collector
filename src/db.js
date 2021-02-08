import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// const connectionString = process.env.DATABASE_URL;
const {  
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

// TODO gagnagrunnstengingar
