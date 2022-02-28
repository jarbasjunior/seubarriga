module.exports = (app) => {
  const create = async (req, res) => {
    const result = await app.services.accounts.save(req.body);
    return res.status(201).json(result[0]);
  };
  return { create };
};
