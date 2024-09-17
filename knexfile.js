/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config(); // Loads environment variables from .env file

module.exports = {
  development: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      extension: 'js',
      directory: './migrations', // Path to store migrations
    },
    seeds: {
      directory: './seeds', // Path to store seed files
    },
  },
  production: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      extension: 'js',
      directory: './migrations', // Path to store migrations
    },
  },
  test: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST_TEST,
      user: process.env.DB_USER_TEST,
      password: process.env.DB_PASSWORD_TEST,
      database: process.env.DB_NAME_TEST,
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};
