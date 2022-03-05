const express = require('express');

module.exports = (app) => {
  const protectedRouter = express.Router();

  protectedRouter.use('/users', app.routes.users);
  protectedRouter.use('/accounts', app.routes.accounts);
  protectedRouter.use('/transactions', app.routes.transactions);
  protectedRouter.use('/transfers', app.routes.transfers);

  app.use('/auth', app.routes.auth);
  app.use('/v1', app.config.passport.authenticate(), protectedRouter);
};
