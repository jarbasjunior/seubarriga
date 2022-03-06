const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  const validate = (req, res, next) => {
    app.services.transfer.validate({ ...req.body, user_id: req.user.id })
      .then(() => next())
      .catch((err) => next(err));
  };

  router.get('/', (req, res, next) => {
    app.services.transfer.read({ user_id: req.user.id })
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post('/', validate, (req, res, next) => {
    app.services.transfer.create({ ...req.body, user_id: req.user.id })
      .then((result) => res.status(201).json(result[0]))
      .catch((err) => next(err));
  });

  router.put('/:id', validate, (req, res, next) => {
    app.services.transfer.update(req.params.id, { ...req.body, user_id: req.user.id })
      .then((result) => res.status(200).json(result[0]))
      .catch((err) => next(err));
  });

  return router;
};
