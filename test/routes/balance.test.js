const request = require('supertest');
const moment = require('moment');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const TRANSACTION_ROUTE = '/v1/transactions';
const TRANSFER_ROUTE = '/v1/transfers';

const TOKEN_USER_3 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDAsIm5hbWUiOiJVc2VyICMzIiwibWFpbCI6InVzZXIzQGVtYWlsLmNvbSJ9.xpdVtUHty8F653khykGBKcKgJ53tJ5mk_GDJLXxZpEw';
const TOKEN_USER_5 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDIsIm5hbWUiOiJVc2VyICM1IiwibWFpbCI6InVzZXI1QGVtYWlsLmNvbSJ9.UXV5us1e-28x9m8uaysYIKF4pMuAkroWf1UrRp0kwLo';

beforeAll(async () => {
  await app.db.seed.run();
});

describe('Quando calcular o saldo, deve:', () => {
  test('Retornar apenas as contas com alguma transação', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(0);
      });
  });

  test('Adicionar valores de entrada', () => {
    const transfer = { account_id: 10100, type: 'I', description: 'Transaction from Account #10100', date: new Date(), ammount: 100.00, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(1);
            expect(result.body[0].id).toBe(transfer.account_id);
            transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
            expect(result.body[0].sum).toBe(transfer.ammount);
          });
      });
  });

  test('Subtrair valores de saída', () => {
    const transfer = { account_id: 10100, type: 'O', description: 'Transaction to Account #10100', date: new Date(), ammount: 200.00, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(1);
            expect(result.body[0].id).toBe(transfer.account_id);
            expect(result.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Desconsiderar transações pendentes', () => {
    const transfer = { account_id: 10100, type: 'O', description: 'Transaction pending', date: new Date(), ammount: 200.00, paid: false };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(1);
            expect(result.body[0].id).toBe(transfer.account_id);
            expect(result.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Desconsiderar saldo de contas distintas', () => {
    const transfer = { account_id: 10101, type: 'I', description: 'Transaction to Account #10101', date: new Date(), ammount: 50, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(2);
            expect(result.body[0].id).toBe(10100);
            expect(result.body[0].sum).toBe('-100.00');
            expect(result.body[1].id).toBe(transfer.account_id);
            transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
            expect(result.body[1].sum).toBe(transfer.ammount);
          });
      });
  });

  test('Desconsiderar de outros usuários', () => {
    const transfer = { account_id: 10102, type: 'O', description: 'Transaction from Account #10102', date: new Date(), ammount: 150.00, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(2);
            expect(result.body[0].id).toBe(10100);
            expect(result.body[0].sum).toBe('-100.00');
            expect(result.body[1].id).toBe(10101);
            expect(result.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Considerar transações passadas', () => {
    const date = moment().subtract({ days: 5 });
    const transfer = { account_id: 10100, type: 'I', description: 'Transaction to Account #10100', date, ammount: 250.00, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(2);
            expect(result.body[0].id).toBe(transfer.account_id);
            expect(result.body[0].sum).toBe('150.00');
            expect(result.body[1].id).toBe(10101);
            expect(result.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Desconsiderar transação futura', () => {
    const date = moment().add({ days: 5 });
    const transfer = { account_id: 10100, type: 'I', description: 'Transaction to Account #10100', date, ammount: 250.00, paid: true };
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(2);
            expect(result.body[0].id).toBe(transfer.account_id);
            expect(result.body[0].sum).toBe('150.00');
            expect(result.body[1].id).toBe(10101);
            expect(result.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Considerar transferências', () => {
    const transfer = { account_origin_id: 10100, account_destiny_id: 10101, description: 'Transfers', date: new Date(), ammount: 250 };
    return request(app).post(TRANSFER_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_3}`)
      .send(transfer)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN_USER_3}`)
          .then((result) => {
            expect(result.status).toBe(200);
            expect(result.body).toHaveLength(2);
            expect(result.body[0].id).toBe(transfer.account_origin_id);
            expect(result.body[0].sum).toBe('-100.00');
            expect(result.body[1].id).toBe(transfer.account_destiny_id);
            expect(result.body[1].sum).toBe('300.00');
          });
      });
  });
});

test('Deve calcular saldo das contas do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN_USER_5}`)
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(2);
      expect(result.body[0].id).toBe(10104);
      expect(result.body[0].sum).toBe('162.00');
      expect(result.body[1].id).toBe(10105);
      expect(result.body[1].sum).toBe('-248.00');
    });
});
