const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@email.com`, password: '123456' });
  user = { ...res[0] };
});

test('Deve inserir uma conta com sucesso', () => {
  const number = Math.floor(Math.random() * 10000) + 1;
  const body = { user_id: user.id, name: `Account ${number}` };
  return request(app).post(MAIN_ROUTE)
    .send(body)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe(body.name);
    });
});

test('Deve listar todas as contas', () => {
  const body = { user_id: user.id, name: 'Account list' };
  return app.db('accounts').insert(body)
    .then(() => request(app).get(MAIN_ROUTE))
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body.length).toBeGreaterThan(0);
    });
});
