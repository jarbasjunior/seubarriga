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
    migrations: {
      directory: 'src/migrations',
    },
  },
};
