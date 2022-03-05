module.exports = (app) => {
  const read = (filter = {}) => {
    return app.db('transfers').where(filter).select();
  };
  return { read };
};
