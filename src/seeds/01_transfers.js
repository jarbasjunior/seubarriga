exports.seed = (knex) => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 10000, name: 'User #1', mail: 'user@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
      { id: 10001, name: 'User #2', mail: 'user2@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10000, name: 'Account Origin #1', user_id: 10000 },
      { id: 10001, name: 'Account Destiny #1', user_id: 10000 },
      { id: 10002, name: 'Account Origin #2', user_id: 10001 },
      { id: 10003, name: 'Account Destiny #2', user_id: 10001 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10000, account_origin_id: 10000, account_destiny_id: 10001, description: 'Tranfer #1', user_id: 10000, date, ammount: 100.00 },
      { id: 10001, account_origin_id: 10002, account_destiny_id: 10003, description: 'Tranfer #2', user_id: 10001, date, ammount: 150.00 },
    ]))
    .then(() => knex('transactions').insert([
      { account_id: 10000, transfer_id: 10000, description: 'Transaction from Account #1', date, ammount: -100.00, type: 'O' },
      { account_id: 10001, transfer_id: 10000, description: 'Transaction to Account #1', date, ammount: 100.00, type: 'I' },
      { account_id: 10002, transfer_id: 10001, description: 'Transaction from Account #2', date, ammount: -150.00, type: 'O' },
      { account_id: 10001, transfer_id: 10001, description: 'Transaction to Account #2', date, ammount: 150.00, type: 'I' },
    ]));
};
