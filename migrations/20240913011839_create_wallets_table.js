/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('wallets');

  if (!exists) {
    await knex.schema.createTable('wallets', function (table) {
      table.specificType('id', 'char(36)').primary().notNullable();
      table.specificType('user_id', 'char(36)').notNullable();
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE'); // Create relationship with user table ( Deletes the row if user is deleted.)
      table.enu('currency', ['USD', 'EUR', 'NGN']).defaultTo('NGN'); // Defines the currency the wallet was created in
      table.bigInteger('balance');
      table.timestamps(false, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  return await knex.schema.dropTableIfExists('wallets');
};
