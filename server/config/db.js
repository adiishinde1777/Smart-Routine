const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let isConnected = false;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_routine_db',
  port: Number(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initDatabase() {
  try {
    // 1. Attempt connection to MySQL server without database first to ensure DB exists
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      charset: 'utf8mb4'
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Now create connection pool with the database
    pool = mysql.createPool(dbConfig);

    // 3. Test connection
    const testConn = await pool.getConnection();
    testConn.release();

    isConnected = true;
    console.log(`✅ [MySQL Database] Successfully connected to '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.log(`ℹ️ [MySQL Database] Notice: Could not connect to MySQL server (${err.message}).`);
    console.log(`ℹ️ Running with Smart Routine In-Memory/Persistent Store.`);
    return false;
  }
}

async function query(sql, params) {
  if (!isConnected || !pool) {
    return null;
  }
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error(`[MySQL Query Error]: ${err.message}`);
    throw err;
  }
}

function isMySQLConnected() {
  return isConnected;
}

module.exports = {
  initDatabase,
  query,
  isMySQLConnected,
  getPool: () => pool
};
