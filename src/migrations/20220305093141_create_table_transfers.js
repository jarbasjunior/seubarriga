exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('transfers', (t) => {
      t.increments('id').primary();
      t.integer('account_origin_id')
        .references('id')
        .inTable('accounts')
        .notNull();
      t.integer('account_destiny_id')
        .references('id')
        .inTable('accounts')
        .notNull();
      t.integer('user_id')
        .references('id')
        .inTable('users')
        .notNull();
      t.string('description').notNull();
      t.date('date').notNull();
      t.decimal('ammount', 15, 2).notNull();
    }),
    knex.schema.table('transactions', (t) => {
      t.integer('transfer_id')
        .references('id')
        .inTable('transfers');
    }),
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.table('transactions', (t) => {
      t.dropColumn('transfer_id');
    }),
    knex.schema.dropTable('transfers'),
  ]);
};
