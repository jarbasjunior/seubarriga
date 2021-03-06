module.exports = {
  test: {
    client: 'pg',
    version: '10.19',
    connection: {
      host: 'localhost',
      port: 5430,
      user: 'postgres',
      password: 'postgres',
      database: 'barriga',
    },
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },
  },
  prod: {
    client: 'pg',
    version: '10.19',
    connection: {
      host: 'localhost',
      port: 5430,
      user: 'postgres',
      password: 'postgres',
      database: 'seubarriga',
    },
    migrations: { directory: 'src/migrations' },
  },
};
