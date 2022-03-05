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

describe('Quando inserir uma transferência válida deve:', async () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { account_origin_id: 10000, account_destiny_id: 10001, description: 'Regular Transfer', user_id: 10000, date, ammount: 50.00 };
  let transferId;
  let credit;
  let debit;
  let transactions;

  test('Retornar o status 201 e os dados da transferência', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)
      .then(async (result) => {
        expect(result.status).toBe(201);
        transfer.date = transfer.date.toISOString();
        transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
        expect(result.body).toMatchObject(transfer);
        transferId = result.body.id;
      });
  });

  test('Gerar as transações de entrada e saída para a transferência', async () => {
    transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    [debit, credit] = transactions;
    expect(transactions).toHaveLength(2);
    expect(transactions[0].description).toBe(`Transfer to account: ${transfer.account_destiny_id}`);
    expect(transactions[1].description).toBe(`Transfer from account: ${transfer.account_origin_id}`);
  });

  test('A transação de saída deve ser negativa', () => {
    const ammountAccOrigin = Math.round(((transfer.ammount * -1) * 100) / 100).toFixed(2);
    expect(debit.ammount).toBe(ammountAccOrigin);
    expect(debit.type).toBe('O');
    expect(debit.account_id).toBe(transfer.account_origin_id);
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(credit.ammount).toBe(transfer.ammount);
    expect(credit.type).toBe('I');
    expect(credit.account_id).toBe(transfer.account_destiny_id);
  });

  test('As duas transações geradas devem referenciar a transferência que a originou', () => {
    expect(debit.transfer_id).toBe(transferId);
    expect(credit.transfer_id).toBe(transferId);
  });
});
