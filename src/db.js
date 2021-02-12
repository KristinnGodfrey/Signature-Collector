import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString, ssl });

export async function insert(name, nationalId, comment, anonymous) {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO signatures(name, nationalId, comment, anonymous) VALUES ($1,$2,$3,$4)', [name, nationalId, comment, anonymous]);
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }
}

export async function select() {
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT * FROM signatures');
    return res.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
  return [];
}
