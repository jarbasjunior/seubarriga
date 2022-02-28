exports.up = (knex) => {
  return knex.schema.createTable('accounts', (t) => {
    t.increments('id').primary();
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNull();
    t.string('name').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('accounts');
};
