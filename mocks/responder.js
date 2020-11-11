'use strict';

const { get } = require('lodash');

/**
 * Example utility to standardise the response format
 * @type {{generateMeta: function, success: function, error: function}}
 */

exports.responder = {
  generateMeta: (req) => ({
    url: get(req, 'url'),
    method: get(req, 'method'),
    timestamp: new Date().toString(),
    requestId: req.header('x-request-id'),
    ip: get(req, 'connection.remoteAddress')
  }),

  success: function ({ status = 200, message = 'OK', data = '' }, req, res) {
    const meta = this.generateMeta(req);

    return res.status(status).json({
      meta,
      message,
      data
    });
  },

  error: function (error, req, res) {
    const meta = this.generateMeta(req);

    const status = get(error, 'status') || 500;
    return res.status(status).json({
      meta,
      message: get(error, 'message') || 'oops, something went wrong!',
      errors: get(error, 'errors') || []
    });
  }
};
