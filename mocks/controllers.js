const healthController = (req, res) => {
  return res.status(200).json({
    message: 'route successfully configured'
  });
};

exports.mockControllers = {
  healthController
};
