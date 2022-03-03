const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';

let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@email.com`, password: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve inserir uma conta com sucesso', () => {
  const number = Math.floor(Math.random() * 10000) + 1;
  const body = { name: `Account ${number}` };
  return request(app).post(MAIN_ROUTE)
    .send(body)
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe(body.name);
    });
});

test('Não deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({})
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Dados inválidos');
    });
});

test('Deve listar todas as contas', () => {
  const body = { user_id: user.id, name: 'Account list' };
  return app.db('accounts').insert(body)
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body.length).toBeGreaterThan(0);
    });
});

test('Deve retornar uma conta por Id', () => {
  const body = { user_id: user.id, name: 'Account by Id' };
  return app.db('accounts').insert(body, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body.user_id).toBe(body.user_id);
      expect(result.body.name).toBe(body.name);
    });
});

test('Deve alterar uma conta', () => {
  const newName = 'Account Updated';
  const body = { user_id: user.id, name: 'Account Update' };
  return app.db('accounts').insert(body, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: newName })
      .set('authorization', `bearer ${user.token}`))
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body.name).toBe(newName);
    });
});

test('Deve remover uma conta', () => {
  const body = { user_id: user.id, name: 'Account to Remove' };
  return app.db('accounts').insert(body, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((result) => {
      expect(result.status).toBe(204);
    });
});
