module.exports = (app) => {
  const read = (filter = {}) => {
    return app.db('transfers').where(filter).select();
  };

  const create = async (transfer) => {
    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transactions = [
      { account_id: transfer.account_origin_id, transfer_id: transferId, description: `Transfer to account: ${transfer.account_destiny_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O' },
      { account_id: transfer.account_destiny_id, transfer_id: transferId, description: `Transfer from account: ${transfer.account_origin_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I' },
    ];

    await app.db('transactions').insert(transactions);
    return result;
  };

  return { read, create };
};
