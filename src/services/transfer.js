const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const validate = async (transfer) => {
    if (!transfer.description || !transfer.date || !transfer.ammount
      || !transfer.account_origin_id || !transfer.account_destiny_id) throw new ValidationError({ message: 'Dados inválidos!', status: 400 });

    const existOriginAccount = await app.db('accounts').where('id', transfer.account_origin_id);
    if (!existOriginAccount.length) throw new ValidationError({ message: `Conta de origem: |${transfer.account_origin_id}| inexistente!`, status: 422 });

    const existDestinyAccount = await app.db('accounts').where('id', transfer.account_destiny_id);
    if (!existDestinyAccount.length) throw new ValidationError({ message: `Conta de destino: |${transfer.account_destiny_id}| inexistente!`, status: 422 });

    if (transfer.account_origin_id === transfer.account_destiny_id) throw new ValidationError({ message: 'Contas de origem e destino não podem ser as mesmas!', status: 422 });

    const accounts = await app.db('accounts').whereIn('id', [transfer.account_origin_id, transfer.account_destiny_id]);
    accounts.forEach((acc) => {
      if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError({ message: `Conta |${acc.id}| não pertence ao usuário!`, status: 422 });
    });
  };

  const read = (filter = {}) => {
    return app.db('transfers').where(filter).select();
  };

  const findOne = (filter) => {
    return app.db('transfers').where(filter).first();
  };

  const update = async (id, transfer) => {
    await validate(transfer);

    const result = await app.db('transfers').where({ id }).update(transfer, '*');

    const transactions = [
      { account_id: transfer.account_origin_id, transfer_id: id, description: `Transfer to account: ${transfer.account_destiny_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O' },
      { account_id: transfer.account_destiny_id, transfer_id: id, description: `Transfer from account: ${transfer.account_origin_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I' },
    ];

    await app.db('transactions').where({ transfer_id: id }).del();
    await app.db('transactions').insert(transactions);
    return result;
  };

  const create = async (transfer) => {
    await validate(transfer);

    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transactions = [
      { account_id: transfer.account_origin_id, transfer_id: transferId, description: `Transfer to account: ${transfer.account_destiny_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O' },
      { account_id: transfer.account_destiny_id, transfer_id: transferId, description: `Transfer from account: ${transfer.account_origin_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I' },
    ];

    await app.db('transactions').insert(transactions);
    return result;
  };

  return { read, findOne, update, create };
};
