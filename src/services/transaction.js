module.exports = (app) => {
  const read = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'account_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };

  const findOne = (filter) => {
    return app.db('transactions').where(filter).first();
  };

  const create = (transaction) => {
    return app.db('transactions').insert(transaction, '*');
  };

  const update = (id, transaction) => {
    return app.db('transactions').where({ id }).update(transaction, '*');
  };

  const remove = (id) => {
    return app.db('transactions').where({ id }).del();
  };

  return { read, findOne, create, update, remove };
};
