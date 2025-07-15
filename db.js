import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PG_URI,
   ssl: {
    rejectUnauthorized: false, // Required for Render-managed PostgreSQL
  },
});

export default pool;
