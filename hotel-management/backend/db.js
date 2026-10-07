const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hotel_db',
};

let pool = new Pool(poolConfig);
let isFallbackMode = false;
let fallbackDb = null;
let fallbackPgClient = null;

// Native SQL DDL for hotels table
const initTableQuery = `
  CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    image VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedInitialData = async () => {
  try {
    const checkRes = await query('SELECT COUNT(*) AS total FROM hotels;');
    const count = parseInt(checkRes.rows[0]?.total || checkRes.rows[0]?.count || 0, 10);
    if (count === 0) {
      const sampleHotels = [
        [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'The Taj Mahal Palace',
          'Iconic luxury hotel overlooking the Arabian Sea and Gateway of India. Features world-class dining, spa, and elegant rooms.',
          18.9217,
          72.8332,
          15500.00
        ],
        [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'Grand Hyatt Resort & Spa',
          'Sprawling 5-star resort featuring lush gardens, multiple swimming pools, luxury suites, and international dining.',
          15.4989,
          73.8311,
          9200.00
        ],
        [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          'The Oberoi Beachfront Suites',
          'Contemporary luxury resort offering panoramic ocean views, private balconies, fine dining, and serene spa facilities.',
          13.0827,
          80.2707,
          12800.00
        ],
        [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'Mountain Breeze Heritage Resort',
          'Tranquil mountain retreat surrounded by tea plantations and pine trees. Perfect for peaceful getaways and nature lovers.',
          10.0889,
          77.0595,
          4800.00
        ],
        [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
          'Royal Palace Heritage Hotel',
          'Historic palace transformed into a boutique hotel with traditional architecture, royal courtyard, and authentic cuisine.',
          26.9124,
          75.7873,
          7500.00
        ],
        [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
          'Lakeside Boutique Retreat',
          'Charming waterside sanctuary featuring private docks, canoeing, cozy fireplace suites, and farm-to-table dining.',
          24.5854,
          73.7125,
          6400.00
        ]
      ];

      for (const h of sampleHotels) {
        await query(
          'INSERT INTO hotels (image, title, description, latitude, longitude, price) VALUES ($1, $2, $3, $4, $5, $6);',
          h
        );
      }
      console.log('[Database] Seeded sample hotel listings into database.');
    }
  } catch (err) {
    console.warn('[Database] Seed initialization notice:', err.message);
  }
};

const setupFallbackDb = () => {
  try {
    const { newDb } = require('pg-mem');
    fallbackDb = newDb();
    fallbackDb.public.none(initTableQuery);
    const adapter = fallbackDb.adapters.createPg();
    fallbackPgClient = new adapter.Pool();
    isFallbackMode = true;
    console.log('----------------------------------------------------');
    console.log('[Database] Notice: Local PostgreSQL server was not reachable.');
    console.log('[Database] Running with in-memory PostgreSQL engine (pg-mem).');
    console.log('[Database] Parameterized SQL queries and REST APIs are fully functional.');
    console.log('[Database] Note: To connect to external/local PostgreSQL, set credentials in backend/.env');
    console.log('----------------------------------------------------');
    seedInitialData();
  } catch (err) {
    console.error('[Database] Error initializing fallback DB:', err);
  }
};

// Test connection and auto-create hotels table
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query(initTableQuery);
    client.release();
    console.log(`[Database] Connected successfully to PostgreSQL database "${poolConfig.database}" at ${poolConfig.host}:${poolConfig.port}`);
    console.log('[Database] "hotels" table verified/created.');
    await seedInitialData();
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection failed: ${err.message}`);
    setupFallbackDb();
  }
};

initDatabase();

// Parameterized Query execution helper using native SQL
const query = async (text, params) => {
  if (isFallbackMode && fallbackPgClient) {
    return await fallbackPgClient.query(text, params);
  }

  try {
    return await pool.query(text, params);
  } catch (err) {
    if (!isFallbackMode) {
      // Fallback on demand if connection dropped
      setupFallbackDb();
      if (fallbackPgClient) {
        return await fallbackPgClient.query(text, params);
      }
    }
    throw err;
  }
};

module.exports = {
  query,
  pool,
};
