module.exports = (app) => {
  const read = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'account_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };

  return { read };
};
