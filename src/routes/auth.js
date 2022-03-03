const jwt = require('jwt-simple');
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

const secret = 'Segredo!';

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    if (!req.body.password) throw new ValidationError({ message: 'Dados inválidos', status: 400 });
    app.services.user.findOne({ mail: req.body.mail })
      .then((user) => {
        if (!user) throw new ValidationError({ message: 'Acesso negado! Usuário e/ou senha inválidos.', status: 401 });
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const payload = {
            id: user.id,
            name: user.name,
            mail: user.mail,
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        } else throw new ValidationError({ message: 'Acesso negado! Usuário e/ou senha inválidos.', status: 401 });
      }).catch((err) => next(err));
  });

  router.post('/signup', (req, res, next) => {
    app.services.user.save(req.body)
      .then((result) => res.status(201).json(result[0]))
      .catch((err) => next(err));
  });

  return router;
};
