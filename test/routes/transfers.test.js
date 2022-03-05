const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXJAZW1haWwuY29tIn0.xhCruIotVVEurw_nK531ubwxqSepunzD22Mx2B2Ktkc';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { id: 10000, account_origin_id: 10000, account_destiny_id: 10001, description: 'Tranfer #1', user_id: 10000, date, ammount: 100.00 };
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((result) => {
      expect(result.status).toBe(200);
      transfer.date = transfer.date.toISOString();
      transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
      expect(result.body[0]).toMatchObject(transfer);
    });
});
