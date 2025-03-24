module.exports = {
  test: {
    client: 'pg',
    version: '17.4',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'root',
      database: 'barriga',
    },
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },
  },
  prod: {
    client: 'pg',
    version: '17.4',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'root',
      database: 'seubarriga',
    },
    migrations: { directory: 'src/migrations' },
  },
};
