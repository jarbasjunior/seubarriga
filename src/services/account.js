module.exports = (app) => {
  const findAll = () => {
    return app.db('accounts').select();
  };

  const save = async (account) => {
    return app.db('accounts').insert(account, '*');
  };

  return { findAll, save };
};
