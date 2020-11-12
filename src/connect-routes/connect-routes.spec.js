'use strict';

const express = require('express');

const { connectRoutes } = require('./connect-routes');
const { mockControllers } = require('../../mocks/controllers');
const { mockMiddleware } = require('../../mocks/middleware');
const version3Mock = require('../../mocks/openapi-v3-example.json');
const version2Mock = require('../../mocks/openapi-v2-example.json');

describe('Connect Routes', () => {
  let app;
  beforeEach(() => {
    app = express();
  });

  describe('When connecting routes', () => {
    const options = {
      controllers: mockControllers,
      middleware: mockMiddleware
    };

    it('should add the routes with controllers to the express application when parsing OpenAPI 3 spec', () => {
      const connect = connectRoutes(version3Mock, options);

      connect(app);

      const routes = app._router.stack.slice(2, 6);

      expect(routes).toHaveLength(4);
      expect(routes[0].route.path).toEqual('/api/v1/health/ping');
      expect(routes[1].route.path).toEqual('/api/v1/user/:id');
      expect(routes[2].route.path).toEqual('/other-url/api/v1/health/ping');
      expect(routes[3].route.path).toEqual('/other-url/api/v1/user/:id');
    });

    it('should add the routes with controllers to the express application when parsing Swagger 2 spec', () => {
      const connect = connectRoutes(version2Mock, options);

      connect(app);

      const routes = app._router.stack.slice(2, 6);

      expect(routes).toHaveLength(2);
      expect(routes[0].route.path).toEqual('/api/v1/health/ping');
      expect(routes[1].route.path).toEqual('/api/v1/user/:id');
    });
  });
});
