const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (userId) => {
    return app.db('accounts').where({ user_id: userId });
  };

  const read = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };

  const update = (id, body) => {
    return app.db('accounts')
      .where({ id })
      .update(body, '*');
  };

  const remove = (id) => {
    return app.db('accounts')
      .where({ id })
      .del();
  };

  const save = async (account) => {
    if (!account.name) throw new ValidationError({ message: 'Dados inválidos', status: 400 });

    const accountDB = await read({ name: account.name, user_id: account.user_id });
    if (accountDB) throw new ValidationError({ message: 'Já existe uma conta com esse nome!', status: 422 });

    return app.db('accounts').insert(account, '*');
  };

  return {
    findAll, read, update, save, remove,
  };
};
