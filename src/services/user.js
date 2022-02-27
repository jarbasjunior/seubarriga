module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  };

  const save = async (user) => {
    if (!user.name || !user.mail || !user.password) return { error: 'Dados inválidos', status: 400 };

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
