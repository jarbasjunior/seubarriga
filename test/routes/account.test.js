const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';

let user;
let user2;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@email.com`, password: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');

  const res2 = await app.services.user.save({ name: 'User Account #2', mail: `${Date.now()}@email.com`, password: '123456' });
  user2 = { ...res2[0] };
  user2.token = jwt.encode(user2, 'Segredo!');
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

test('Não deve inserir uma conta de nome duplicado para o mesmo usuário', () => {
  return app.db('accounts').insert({ name: 'Conta duplicada', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({ name: 'Conta duplicada' })
      .then((result) => {
        expect(result.status).toBe(422);
        expect(result.body.error).toBe('Já existe uma conta com esse nome!');
      }));
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

test('Deve listar apenas as contas do usuário', () => {
  return app.db('accounts').insert([
    { name: 'Account User #1', user_id: user.id },
    { name: 'Account User #2', user_id: user2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user2.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Account User #2');
    }));
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

test('Não deve retornar uma conta de outro usuário', () => {
  return app.db('accounts').insert({ name: 'Conta usuário #2', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user2.token}`)
      .then((result) => {
        expect(result.status).toBe(403);
        expect(result.body.error).toBe('Recurso não está disponível para este usuário!');
      }));
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
