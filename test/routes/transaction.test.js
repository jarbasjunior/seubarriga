const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';

let user;
let user2;

let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert([
    { name: 'User #1', mail: 'user@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    { name: 'User #2', mail: 'user2@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
  ], '*');
  [user, user2] = users;

  delete user.password;
  user.token = jwt.encode(user, 'Segredo!');

  const accounts = await app.db('accounts').insert([
    { name: 'Account #1', user_id: user.id },
    { name: 'Account #2', user_id: user2.id },
  ], '*');
  [accUser, accUser2] = accounts;
});

test('Deve listar apenas as transações do usuário', () => {
  const transaction1 = { description: 'T1', date: '2022-03-03T03:00:00.000Z', ammount: 100.03, type: 'I', account_id: accUser.id };
  const transaction2 = { description: 'T2', date: new Date(), ammount: 400, type: 'O', account_id: accUser2.id };
  return app.db('transactions').insert([transaction1, transaction2]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0].description).toBe(transaction1.description);
    }));
});