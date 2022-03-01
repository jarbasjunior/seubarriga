const request = require('supertest');

const app = require('../../src/app');

test('Deve receber token ao se autenticar', () => {
  const user = { name: 'Walter', mail: `${Date.now()}@email.com`, password: '123456' };
  return app.services.user.save(user)
    .then(() => request(app).post('/auth/signin')
      .send({ mail: user.mail, password: user.password }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).not.toBeNull();
    });
});

test('Não deve autenticar com senha inválida', () => {
  const user = { name: 'Walter', mail: `${Date.now()}@email.com`, password: '123456' };
  return app.services.user.save(user)
    .then(() => request(app).post('/auth/signin')
      .send({ mail: user.mail, password: '654321' }))
    .then((res) => {
      expect(res.status).toBe(401);
      expect(res.body.token).not.toBeNull();
      expect(res.body.error).toBe('Acesso negado! Usuário e/ou senha inválidos.');
    });
});

test('Não deve autenticar com e-mail inválido', () => {
  return request(app).post('/auth/signin')
    .send({ mail: 'nao_existo_na_base@email.com', password: '654321' })
    .then((res) => {
      expect(res.status).toBe(401);
      expect(res.body.token).not.toBeNull();
      expect(res.body.error).toBe('Acesso negado! Usuário e/ou senha inválidos.');
    });
});
