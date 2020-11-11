'use strict';

const { responder } = require('./responder');

const healthController = (req, res) => {
  return responder.success(
    {
      message: 'pong',
      data: {
        hmSuccess: req.body.hmSuccess
      }
    },
    req,
    res
  );
};

const updateUserController = (req, res) => {
  const { id } = req.params;

  const { firstName, surname, email, age, mwSuccess = '' } = req.body;

  const updatedUser = {
    mwSuccess,
    id: +id,
    firstName: firstName.reverse(),
    surname: surname.reverse(),
    email: email.reverse,
    age: age + 1
  };

  return responder.success(
    {
      message: 'successfully updated user',
      data: {
        ...updatedUser
      }
    },
    req,
    res
  );
};

exports.mockControllers = {
  healthController,
  updateUserController
};
