import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();


// console.log(DATABASE_URL);
const {  
  DATABASE_URL: connectionString,
} = process.env;

// console.log(process.env);

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}
