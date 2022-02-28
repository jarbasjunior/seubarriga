module.exports = (app) => {
  const findAll = (req, res) => {
    app.services.account.findAll()
      .then((result) => res.status(200).json(result));
  };

  const create = async (req, res) => {
    const result = await app.services.account.save(req.body);
    return res.status(201).json(result[0]);
  };

  const read = (req, res) => {
    app.services.account.read({ id: req.params.id })
      .then((result) => res.status(200).json(result));
  };

  const update = (req, res) => {
    app.services.account.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]));
  };

  return { findAll, create, read, update };
};
