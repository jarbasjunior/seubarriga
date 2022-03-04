const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';

let user;
let user2;

let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert([
    { name: 'User #1', mail: 'user@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
    { name: 'User #2', mail: 'user2@email.com', password: '$2a$10$DR3VXgsOe5KFg/MoT3GSJ.oVpvWaJKxM0f6kzYsr4CKAZ6j14zO5m' },
  ], '*');
  [user, user2] = users;

  delete user.password;
  user.token = jwt.encode(user, 'Segredo!');

  const accounts = await app.db('accounts').insert([
    { name: 'Account #1', user_id: user.id },
    { name: 'Account #2', user_id: user2.id },
  ], '*');
  [accUser, accUser2] = accounts;
});

test('Deve listar apenas as transações do usuário', () => {
  const transaction1 = { description: 'T1', date: new Date(), ammount: 100.03, type: 'I', account_id: accUser.id };
  const transaction2 = { description: 'T2', date: new Date(), ammount: 400, type: 'O', account_id: accUser2.id };
  return app.db('transactions').insert([transaction1, transaction2]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0].description).toBe(transaction1.description);
    }));
});

test('Deve inserir transação com sucesso', () => {
  const transaction = { description: 'T1', date: new Date('00', '00', '00', '0'), ammount: 100.03, type: 'I', account_id: accUser.id };
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send(transaction)
    .then((result) => {
      expect(result.status).toBe(201);
      transaction.date = transaction.date.toISOString();
      transaction.ammount = transaction.ammount.toString();
      expect(result.body).toMatchObject(transaction);
    });
});

test('Transações de entrada devem ser positivas', () => {
  const transaction = { description: 'Transaction input', date: new Date('00', '00', '00', '0'), ammount: -100.03, type: 'I', account_id: accUser.id };
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send(transaction)
    .then((result) => {
      expect(result.status).toBe(201);
      transaction.ammount = (transaction.ammount * -1).toString();
      expect(result.body.ammount).toBe(transaction.ammount);
    });
});

test('Transações de saída devem ser negativas', () => {
  const transaction = { description: 'Transaction output', date: new Date('00', '00', '00', '0'), ammount: 100.03, type: 'O', account_id: accUser.id };
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send(transaction)
    .then((result) => {
      expect(result.status).toBe(201);
      transaction.ammount = (transaction.ammount * -1).toString();
      expect(result.body.ammount).toBe(transaction.ammount);
    });
});

describe('Ao tentar inserir uma transação com campos obrigatórios ausentes', () => {
  let validTransaction;
  beforeEach(() => {
    validTransaction = { description: 'T without required fields', date: new Date(), ammount: 200.00, type: 'I', account_id: accUser.id };
  });

  const testRequiredFields = (field) => {
    delete validTransaction[field];
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send(validTransaction)
      .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Dados inválidos!');
      });
  };

  test('Não deve inserir sem descrição', () => testRequiredFields('description'));
  test('Não deve inserir sem data', () => testRequiredFields('date'));
  test('Não deve inserir sem valor', () => testRequiredFields('ammount'));
  test('Não deve inserir sem tipo', () => testRequiredFields('type'));
  test('Não deve inserir sem id da conta', () => testRequiredFields('account_id'));
});

test('Deve retornar uma transação por ID', () => {
  return app.db('transactions')
    .insert({ description: 'T ID', date: new Date(), ammount: 100.03, type: 'I', account_id: accUser.id }, ['id'])
    .then((res) => request(app).get(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(res[0].id);
        expect(result.body.description).toBe('T ID');
      }));
});

test('Não deve retornar uma transação por ID de outro usuário', () => {
  return app.db('transactions')
    .insert({ description: 'Transaction should not to show', date: new Date(), ammount: 403.47, type: 'I', account_id: accUser2.id }, ['id'])
    .then((res) => request(app).get(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(403);
        expect(result.body.error).toBe('Recurso não está disponível para este usuário!');
      }));
});

test('Deve alterar uma transação', () => {
  return app.db('transactions')
    .insert({ description: 'To update', date: new Date(), ammount: 143.03, type: 'I', account_id: accUser.id }, ['id'])
    .then((res) => request(app).put(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .send({ description: 'Transaction updated' })
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(res[0].id);
        expect(result.body.description).toBe('Transaction updated');
      }));
});

test('Não deve alterar uma transação de outro usuário', () => {
  return app.db('transactions')
    .insert({ description: 'Transaction not to update', date: new Date(), ammount: 403.47, type: 'I', account_id: accUser2.id }, ['id'])
    .then((res) => request(app).put(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(403);
        expect(result.body.error).toBe('Recurso não está disponível para este usuário!');
      }));
});

test('Deve remover uma transação', () => {
  return app.db('transactions')
    .insert({ description: 'Transaction to remove', date: new Date(), ammount: 500.47, type: 'I', account_id: accUser.id }, ['id'])
    .then((res) => request(app).delete(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(204);
      }));
});

test('Não deve remover uma transação de outro usuário', () => {
  return app.db('transactions')
    .insert({ description: 'Transaction not to remove', date: new Date(), ammount: 500.47, type: 'I', account_id: accUser2.id }, ['id'])
    .then((res) => request(app).delete(`${MAIN_ROUTE}/${res[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(403);
        expect(result.body.error).toBe('Recurso não está disponível para este usuário!');
      }));
});
