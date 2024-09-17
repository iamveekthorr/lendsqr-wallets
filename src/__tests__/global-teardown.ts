module.exports = async () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const Knex = require('knex');
  const dotenv = require('dotenv');

  dotenv.config();

  const database = 'users-mock';

  try {
    const knex = Knex({
      client: 'mysql',
      connection: {
        host: process.env.DB_HOST_TEST,
        user: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        port: 5432,
      },
    });

    await knex.raw(`DROP DATABASE IF EXISTS ${database}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
