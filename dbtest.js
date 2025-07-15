import pool from './db.js';

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  } finally {
    await pool.end(); // Close the pool after use
  }
}

testConnection();
