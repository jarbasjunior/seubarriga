const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN_USER_1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXJAZW1haWwuY29tIn0.xhCruIotVVEurw_nK531ubwxqSepunzD22Mx2B2Ktkc';
const TOKEN_USER_2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDEsIm5hbWUiOiJVc2VyICMyIiwibWFpbCI6InVzZXIyQGVtYWlsLmNvbSJ9.5ChltS3mD_fRY3ZHAqo9-5YTxbbGd_Bw-5_Ub8BJzjM';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { id: 10000, account_origin_id: 10000, account_destiny_id: 10001, description: 'Tranfer #1', user_id: 10000, date, ammount: 100.00 };
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN_USER_1}`)
    .then((result) => {
      expect(result.status).toBe(200);
      transfer.date = transfer.date.toISOString();
      transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
      expect(result.body[0]).toMatchObject(transfer);
    });
});

test('Deve retornar uma transferência por ID', () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { id: 10001, account_origin_id: 10002, account_destiny_id: 10003, description: 'Tranfer #2', user_id: 10001, date, ammount: 150.00 };
  return request(app).get(`${MAIN_ROUTE}/${transfer.id}`)
    .set('authorization', `bearer ${TOKEN_USER_2}`)
    .then((result) => {
      expect(result.status).toBe(200);
      transfer.date = transfer.date.toISOString();
      transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
      expect(result.body).toMatchObject(transfer);
    });
});

test('Não deve retornar uma transferência de outro usuário', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN_USER_1}`)
    .then((result) => {
      expect(result.status).toBe(403);
      expect(result.body.error).toBe('Recurso não está disponível para este usuário!');
    });
});

describe('Quando inserir uma transferência válida deve:', async () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { account_origin_id: 10000, account_destiny_id: 10001, description: 'Regular Transfer', user_id: 10000, date, ammount: 50.00 };
  let credit;
  let debit;
  let transactions;
  let response;

  beforeAll(() => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .send(transfer)
      .then(async (result) => {
        response = result;
        transactions = await app.db('transactions').where({ transfer_id: response.body.id }).orderBy('ammount');
        [debit, credit] = transactions;
      });
  });

  test('Retornar o status 201 e os dados da transferência', () => {
    transfer.date = transfer.date.toISOString();
    transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(transfer);
  });

  test('Gerar as transações de entrada e saída para a transferência', async () => {
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
    expect(debit.transfer_id).toBe(response.body.id);
    expect(credit.transfer_id).toBe(response.body.id);
  });

  test('Ambas devem estar com status de pagas', () => {
    expect(debit.paid).toBe(true);
    expect(credit.paid).toBe(true);
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
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .send(newBody)
      .then((result) => {
        expect(result.status).toBe(422);
        expect(result.body.error).toBe(message);
      });
  };

  const testRequiredFields = (field) => {
    delete validTransfer[field];
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
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

describe('Quando alterar uma transferência válida deve:', async () => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
  const transfer = { account_origin_id: 10000, account_destiny_id: 10001, description: 'Updated Transfer', user_id: 10000, date, ammount: 80.00 };
  const transferId = 10000;
  let credit;
  let debit;
  let transactions;

  test('Retornar o status 201 e os dados da transferência', () => {
    return request(app).put(`${MAIN_ROUTE}/${transferId}`)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .send(transfer)
      .then(async (result) => {
        expect(result.status).toBe(200);
        transfer.date = transfer.date.toISOString();
        transfer.ammount = Math.round((transfer.ammount * 100) / 100).toFixed(2);
        expect(result.body).toMatchObject(transfer);
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

describe('Na tentativa de atualizar uma transferência inválida, não deve alterar:', () => {
  const transferId = 10000;
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
    return request(app).put(`${MAIN_ROUTE}/${transferId}`)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .send(newBody)
      .then((result) => {
        expect(result.status).toBe(422);
        expect(result.body.error).toBe(message);
      });
  };

  const testRequiredFields = (field) => {
    delete validTransfer[field];
    return request(app).put(`${MAIN_ROUTE}/${transferId}`)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
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

describe('Quando remover uma transferência, deve:', () => {
  let transferId;
  let expectedStatusCode;

  beforeAll(async () => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), '00', '00', '00', '0');
    const validTransfer = { account_origin_id: 10000, account_destiny_id: 10001, description: 'Transfer to remove', user_id: 10000, date, ammount: 50.00 };
    await request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .send(validTransfer)
      .then((result) => {
        expect(result.status).toBe(201);
        transferId = result.body.id;
      });
    return request(app).delete(`${MAIN_ROUTE}/${transferId}`)
      .set('authorization', `bearer ${TOKEN_USER_1}`)
      .then((result) => {
        expectedStatusCode = result.status;
      });
  });

  test('Retornar o status 204', () => {
    expect(expectedStatusCode).toBe(204);
  });

  test('Remover transações associadas', () => {
    return app.db('transactions').where({ transfer_id: transferId })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });

  test('Remover registro do banco de transferências', () => {
    return app.db('transfers').where({ id: transferId })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });
});
