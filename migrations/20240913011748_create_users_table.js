/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('users');

  if (!exists) {
    await knex.schema.createTable('users', function (table) {
      table.specificType('id', 'BINARY(16)').primary().notNullable();
      table.string('first_name', 255).notNullable();
      table.string('last_name', 255).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.timestamps(false, true);
      table.enu('role', ['user', 'admin']).notNullable().defaultTo('user');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  return await knex.schema.dropTableIfExists('users');
};
