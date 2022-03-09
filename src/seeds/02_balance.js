const moment = require('moment');

exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10100, name: 'User #3', mail: 'user3@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    { id: 10101, name: 'User #4', mail: 'user4@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    { id: 10102, name: 'User #5', mail: 'user5@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
  ])
    .then(() => knex('accounts').insert([
      { id: 10100, name: 'Main Account', user_id: 10100 },
      { id: 10101, name: 'Secundary Account', user_id: 10100 },
      { id: 10102, name: 'Alternative Account #1', user_id: 10101 },
      { id: 10103, name: 'Alternative Account #2', user_id: 10101 },
      { id: 10104, name: 'General Account #3', user_id: 10102 },
      { id: 10105, name: 'General Account #4', user_id: 10102 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10100, account_origin_id: 10105, account_destiny_id: 10104, description: 'Tranfer #1', user_id: 10102, date: new Date(), ammount: 256 },
      { id: 10101, account_origin_id: 10102, account_destiny_id: 10103, description: 'Tranfer #2', user_id: 10101, date: new Date(), ammount: 512 },
    ]))
    .then(() => knex('transactions').insert([
      { account_id: 10104, description: 'Transaction', date: new Date(), ammount: 2, type: 'I', paid: true },
      { account_id: 10102, description: 'Transaction', date: new Date(), ammount: 4, type: 'I', paid: true },
      { account_id: 10105, description: 'Transaction', date: new Date(), ammount: 8, type: 'I', paid: true },
      { account_id: 10104, description: 'Transaction', date: new Date(), ammount: 16, type: 'I', paid: false },
      { account_id: 10104, description: 'Transaction', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', paid: true },
      { account_id: 10104, description: 'Transaction', date: moment().add({ days: 5 }), ammount: 64, type: 'I', paid: false },
      { account_id: 10104, description: 'Transaction', date: new Date(), ammount: -128, type: 'O', paid: true },
      { account_id: 10104, description: 'Transaction', date: new Date(), ammount: 256, type: 'I', paid: true },
      { account_id: 10105, description: 'Transaction', date: new Date(), ammount: -256, type: 'O', paid: true },
      { account_id: 10103, description: 'Transaction', date: new Date(), ammount: 512, type: 'I', paid: true },
      { account_id: 10102, description: 'Transaction', date: new Date(), ammount: -512, type: 'O', paid: true },
    ]));
};
