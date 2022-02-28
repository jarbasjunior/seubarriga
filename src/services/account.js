module.exports = (app) => {
  const findAll = () => {
    return app.db('accounts').select();
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
    return app.db('accounts').insert(account, '*');
  };

  return {
    findAll, read, update, save, remove,
  };
};
