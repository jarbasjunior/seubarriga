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
