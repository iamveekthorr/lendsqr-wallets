/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('wallets');

  if (!exists) {
    await knex.schema.createTable('wallets', function (table) {
      table.specificType('id', 'BINARY(16)').primary().notNullable();
      table.specificType('user_id', 'BINARY(16)').notNullable();
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE'); // Create relationship with user table ( Deletes the row if user is deleted.)
      table.enu('currency', ['USD', 'EUR', 'NGN', 'GPB']).defaultTo('NGN'); // Defines the currency the wallet was created in
      table.bigInteger('balance').defaultTo(0.0);
      table.timestamps(false, true);

      // Add unique constraint to ensure user can only have one wallet per currency
      table.unique(['user_id', 'currency']);
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
