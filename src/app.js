const app = require('express')();
const knex = require('knex');
const consign = require('consign');
const knexfile = require('../knexfile');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false })
  .include('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/routes.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((err, req, res, next) => {
  const {
    name, message, status, stack,
  } = err;
  if (name === 'ValidationError') res.status(status).json({ error: message });
  else res.status(500).json({ name, message, stack });
  next(err);
});

module.exports = app;
