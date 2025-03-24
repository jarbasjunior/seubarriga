const app = require('express')();
const knex = require('knex');
const uuid = require('uuidv4');
const consign = require('consign');
const winston = require('winston');
const knexfile = require('../knexfile');

app.db = knex(knexfile[process.env.NODE_ENV]);

app.log = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({ format: winston.format.json({ space: 1 }) }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json({ space: 1 })),
    }),
  ],
});

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).json({ healthy: 'OK!' });
});

app.use((err, req, res, next) => {
  const { name, message, status, stack } = err;
  if (name === 'ValidationError') res.status(status).json({ error: message });
  else {
    const id = uuid();
    app.log.error({ id, name, message, stack });
    res.status(500).json({ id, error: 'Internal Error' });
  }
  next(err);
});

module.exports = app;
