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

test.only('Deve retornar uma transferência por ID', () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { id: 10001, account_origin_id: 10002, account_destiny_id: 10003, description: 'Tranfer #2', user_id: 10001, date, ammount: 150.00 };
  return request(app).get(`${MAIN_ROUTE}/${transfer.id}`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((result) => {
      expect(result.status).toBe(200);
      transfer.date = transfer.date.toISOString();
      transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
      expect(result.body).toMatchObject(transfer);
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

describe('Na tentativa de salvar uma transferência inválida, não deve inserir:', () => {
  let date;
  let validTransfer;
  let invalidOriginAccount;
  let invalidDestinyAccount;

  beforeEach(() => {
    date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
    validTransfer = { account_origin_id: 10000, account_destiny_id: 10001, description: 'Regular Transfer', user_id: 10000, date, ammount: 50.00 };
    invalidOriginAccount = validTransfer.account_origin_id * 100;
    invalidDestinyAccount = validTransfer.account_destiny_id * 100;
  });

  const testInvalidValues = (fieldValue, message) => {
    const newBody = { ...validTransfer, ...fieldValue };
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(newBody)
      .then((result) => {
        expect(result.status).toBe(422);
        expect(result.body.error).toBe(message);
      });
  };

  const testRequiredFields = (field) => {
    delete validTransfer[field];
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(validTransfer)
      .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Dados inválidos!');
      });
  };

  test('Sem descrição', () => testRequiredFields('description'));
  test('Sem data', () => testRequiredFields('date'));
  test('Sem valor', () => testRequiredFields('ammount'));
  test('Sem conta de origem', () => testRequiredFields('account_origin_id'));
  test('Sem conta de destino', () => testRequiredFields('account_destiny_id'));
  test('Se as contas de origem e destino forem as mesmas', () => testInvalidValues({ account_destiny_id: validTransfer.account_origin_id }, 'Contas de origem e destino não podem ser as mesmas!'));
  test('Se a conta de origem pertecer a outro usuário', () => testInvalidValues({ account_origin_id: 10002 }, 'Conta |10002| não pertence ao usuário!'));
  test('Se a conta de destino pertecer a outro usuário', () => testInvalidValues({ account_destiny_id: 10003 }, 'Conta |10003| não pertence ao usuário!'));
  test('Se a conta de origem não existir', () => testInvalidValues({ account_origin_id: invalidOriginAccount }, `Conta de origem: |${invalidOriginAccount}| inexistente!`));
  test('Se a conta de destino não existir', () => testInvalidValues({ account_destiny_id: invalidDestinyAccount }, `Conta de destino: |${invalidDestinyAccount}| inexistente!`));
});
