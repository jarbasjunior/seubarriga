exports.up = (knex) => {
  return knex.schema.createTable('transactions', (t) => {
    t.increments('id').primary();
    t.integer('account_id')
      .references('id')
      .inTable('accounts')
      .notNull();
    t.string('description').notNull();
    t.enu('type', ['I', 'O']).notNull();
    t.date('date').notNull();
    t.decimal('ammount', 15, 2).notNull();
    t.boolean('paid').notNull().default(false);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('transactions');
};
