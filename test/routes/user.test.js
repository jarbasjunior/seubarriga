const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';

let userAllowed;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@email.com`, password: '123456' });
  userAllowed = { ...res[0] };
  userAllowed.token = jwt.encode(userAllowed, 'Segredo!');
});

test('Deve listar todos os usuários', async () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  await request(app).post(MAIN_ROUTE).send(user);
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${userAllowed.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuário com sucesso', () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  return request(app).post(MAIN_ROUTE)
    .send(user)
    .set('authorization', `bearer ${userAllowed.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      delete user.password;
      expect(res.body).toMatchObject(user);
    });
});

describe('Na tentativa de inserir usuário, não deve:', () => {
  const validUser = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };

  const testRequiredFields = (field) => {
    delete validUser[field];
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAllowed.token}`)
      .send(validUser)
      .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Dados inválidos!');
      });
  };

  test('Inserir sem nome', () => testRequiredFields('name'));
  test('Inserir sem e-mail', () => testRequiredFields('mail'));
  test('Inserir sem senha', () => testRequiredFields('password'));
});

test('Deve armazenar senha criptografada', async () => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' })
    .set('authorization', `bearer ${userAllowed.token}`);

  expect(result.status).toBe(201);

  const { id } = result.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBeUndefined();
  expect(userDB.password).not.toBe('123456');
});

test('Não deve inserir usuário com e-mail existente', async () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  const newUser = { name: 'Walter Mitty Dois', mail: user.mail, password: '654321' };
  await request(app).post(MAIN_ROUTE).send(user)
    .set('authorization', `bearer ${userAllowed.token}`);

  return request(app).post(MAIN_ROUTE)
    .send(newUser)
    .set('authorization', `bearer ${userAllowed.token}`)
    .then((res) => {
      expect(res.status).toBe(422);
      expect(res.body.error).toBe('E-mail já cadastrado');
    });
});

test('Não deve acessar a rota de usuários sem token', () => {
  return request(app).get(MAIN_ROUTE)
    .then((result) => {
      expect(result.status).toBe(401);
    });
});
