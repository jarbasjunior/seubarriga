const request = require('supertest');
const app = require('../../src/app');

test('Deve listar todos os usuários', async () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  await request(app).post('/users').send(user);
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuário com sucesso', () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  return request(app).post('/users')
    .send(user)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter Mitty');
      expect(res.body.mail).toBe(user.mail);
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Não deve inserir usuário sem nome', () => {
  return request(app).post('/users')
    .send({ mail: 'mail@email.com', password: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Dados inválidos');
    });
});

test('Não deve inserir usuário sem e-mail', async () => {
  const result = await request(app).post('/users')
    .send({ name: 'Walter Mitty', password: '123456' });

  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Dados inválidos');
});

test('Não deve inserir usuário sem senha', (done) => {
  request(app).post('/users')
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@email.com` })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Dados inválidos');
      done();
    });
});

test('Deve armazenar senha criptografada', async () => {
  const result = await request(app).post('/users')
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' });

  expect(result.status).toBe(201);

  const { id } = result.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBeUndefined();
  expect(userDB.password).not.toBe('123456');
});

test('Não deve inserir usuário com e-mail existente', async () => {
  const user = { name: 'Walter Mitty', mail: `${Date.now()}@email.com`, password: '123456' };
  const newUser = { name: 'Walter Mitty Dois', mail: user.mail, password: '654321' };
  await request(app).post('/users').send(user);

  return request(app).post('/users')
    .send(newUser)
    .then((res) => {
      expect(res.status).toBe(422);
      expect(res.body.error).toBe('E-mail já cadastrado');
    });
});
