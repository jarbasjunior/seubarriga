const ValidationError = require('../errors/ValidationError');

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
    if (!transaction.description || !transaction.date || !transaction.ammount
      || !transaction.type || !transaction.account_id) throw new ValidationError({ message: 'Dados inválidos!', status: 400 });

    const newTransaction = { ...transaction };

    if ((transaction.type === 'I' && transaction.ammount < 0)
      || (transaction.type === 'O' && transaction.ammount > 0)) {
      newTransaction.ammount *= -1;
    }

    return app.db('transactions').insert(newTransaction, '*');
  };

  const update = (id, transaction) => {
    return app.db('transactions').where({ id }).update(transaction, '*');
  };

  const remove = (id) => {
    return app.db('transactions').where({ id }).del();
  };

  return { read, findOne, create, update, remove };
};
