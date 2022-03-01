const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select(['id', 'name', 'mail']);
  };

  const findOne = (filter = {}) => {
    if (((Object.keys(filter)[0] === 'mail') && !filter.mail) || ((Object.keys(filter)[0] === 'id') && !filter.id)) {
      throw new ValidationError({ message: 'Dados inválidos', status: 400 });
    }
    return app.db('users').where(filter).first();
  };

  const passHash = (pass) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  };

  const save = async (user) => {
    if (!user.name || !user.mail || !user.password) throw new ValidationError({ message: 'Dados inválidos', status: 400 });

    const userDb = await findOne({ mail: user.mail });
    if (userDb) throw new ValidationError({ message: 'E-mail já cadastrado', status: 422 });

    const newUser = { ...user };
    newUser.password = passHash(user.password);
    return app.db('users').insert(newUser, ['id', 'name', 'mail']);
  };

  return { findAll, findOne, save };
};
