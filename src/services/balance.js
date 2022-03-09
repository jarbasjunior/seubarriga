module.exports = (app) => {
  const read = (userId) => {
    return app.db('transactions as t').sum('ammount')
      .join('accounts as acc', 'acc.id', '=', 't.account_id')
      .where({ user_id: userId, paid: true })
      .where('date', '<=', new Date())
      .select('acc.id')
      .groupBy('acc.id')
      .orderBy('acc.id', 'asc');
  };

  return { read };
};
