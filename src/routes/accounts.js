module.exports = (app) => {
  const findAll = (req, res) => {
    app.services.account.findAll()
      .then((result) => res.status(200).json(result));
  };

  const create = async (req, res) => {
    const result = await app.services.account.save(req.body);

    if (result.status === 400) return res.status(400).json(result);

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

  const remove = (req, res) => {
    app.services.account.remove(req.params.id)
      .then(() => res.status(204).send());
  };

  return {
    findAll, create, read, update, remove,
  };
};
