module.exports = () => {
  const findAll = (req, res) => {
    const user = [
      { name: 'John Doe', mail: 'john_doe@email.com' },
    ];
    res.status(200).json(user);
  };

  const create = (req, res) => {
    res.status(201).json(req.body);
  };

  return { findAll, create };
};
