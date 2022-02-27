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

module.exports = app;
