const healthMiddleware = (req, res, next) => {
  req.body.testHealthFunction();

  next();
};

exports.mockMiddleware = {
  healthMiddleware
};
