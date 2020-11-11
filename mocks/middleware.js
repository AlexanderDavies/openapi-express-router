'use strict';

const healthMiddleware = (req, res, next) => {
  req.body.hmSuccess = 'success';

  next();
};

const updateUserMiddleware = (req, res, next) => {
  req.body.mwSuccess = 'success!';
  next();
};

exports.mockMiddleware = {
  healthMiddleware,
  updateUserMiddleware
};
