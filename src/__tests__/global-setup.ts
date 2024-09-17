/* eslint-disable @typescript-eslint/no-var-requires */
const Knex = require('knex');
const dotenv = require('dotenv');

dotenv.config();

// Create the database
async function createTestDatabase() {
  const database = 'users-mock';

  const connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 5432,
  };

  const knex = Knex({
    client: 'mysql',
    connection,
  });

  try {
    console.log(`\nCreating test database...`);
    await knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await knex.raw(`CREATE DATABASE ${database}`);
    console.log(`Created...`);
  } catch (error) {
    throw new Error(error);
  } finally {
    await knex.destroy();
  }
}

// Seed the database with schema and data
async function seedTestDatabase() {
  const connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 5432,
  };

  const knex = Knex({
    client: 'mysql',
    connection,
    debug: true,
  });

  try {
    await knex.migrate.latest();
    await knex.seed.run();
  } catch (error) {
    throw new Error(error);
  } finally {
    await knex.destroy();
  }
}

module.exports = async () => {
  try {
    await createTestDatabase();
    await seedTestDatabase();
    console.log('Test database created successfully');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
