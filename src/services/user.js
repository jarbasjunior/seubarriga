module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name || !user.mail || !user.password) return { error: 'Dados inválidos', status: 400 };

    const userDb = await findAll({ mail: user.mail });
    if (userDb && userDb.length > 0) return { error: 'E-mail já cadastrado', status: 422 };

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
