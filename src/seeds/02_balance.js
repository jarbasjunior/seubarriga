exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10100, name: 'User #3', mail: 'user3@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    { id: 10101, name: 'User #4', mail: 'user4@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
  ])
    .then(() => knex('accounts').insert([
      { id: 10100, name: 'Main Account', user_id: 10100 },
      { id: 10101, name: 'Secundary Account', user_id: 10100 },
      { id: 10102, name: 'Alternative Account #1', user_id: 10101 },
      { id: 10103, name: 'Alternative Account #2', user_id: 10101 },
    ]));
};
