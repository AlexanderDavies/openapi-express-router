'use strict';

const connectRoutesService = require('./connect-routes.service');
const version3Mock = require('../../mocks/openapi-v3-example.json');
const version2Mock = require('../../mocks/openapi-v2-example.json');
const { mockMiddleware } = require('../../mocks/middleware');
const { mockControllers } = require('../../mocks/controllers');

describe('Connect Routes Service', () => {
  const options = {
    controllers: mockControllers,
    middleware: mockMiddleware
  };

  describe('Recursive Search', () => {
    it('Should return the matched property', () => {
      const testObj = {
        someProp: {
          someNestedProp: 'success'
        }
      };

      const result = connectRoutesService.recursiveSearch(testObj, 'someNestedProp');

      expect(result).toEqual('success');
    });
  });

  describe('When getting the base path', () => {
    it('should return the base path if using OpenAPI version 2', () => {
      const result = connectRoutesService.getBasePath(version2Mock, 2);

      expect(result).toEqual(['/api/v1']);
    });

    it('should return the base path if using OpenAPI version 3', () => {
      const result = connectRoutesService.getBasePath(version3Mock, 3);

      expect(result).toEqual(['/api/v1', '/other-url/api/v1']);
    });

    it('should return an empty string if no version is provided', () => {
      const result = connectRoutesService.getBasePath();

      expect(result).toEqual('');
    });
  });

  describe('When parsing route params', () => {
    const noParamPath = '/health/ping';
    const paramPath = '/user/{id}';
    const parsedParamPath = '/user/:id';

    it('should return the path if no params found', () => {
      const path = connectRoutesService.parseParams(noParamPath);

      expect(path).toEqual(noParamPath);
    });

    it('should return the formatted param if present', () => {
      const path = connectRoutesService.parseParams(paramPath);

      expect(path).toEqual(parsedParamPath);
    });
  });

  describe('When mapping middleware', () => {
    it('should return the mapped middleware', () => {
      const middleware = options.middleware;
      const resultOpenAPI2 = connectRoutesService.mapMiddleware(
        version2Mock.paths['/health/ping'].get['x-middleware'],
        middleware
      );
      const resultOpenAPI3 = connectRoutesService.mapMiddleware(
        version3Mock.paths['/health/ping'].get['x-middleware'],
        middleware
      );
      expect(resultOpenAPI2).toEqual([options.middleware.healthMiddleware]);
      expect(resultOpenAPI3).toEqual([options.middleware.healthMiddleware]);
    });

    it('should return the mapped middleware if it is deeply nested', () => {
      const middleware = {
        nestedMiddleware: options.middleware
      };
      const resultOpenAPI2 = connectRoutesService.mapMiddleware(
        version2Mock.paths['/health/ping'].get['x-middleware'],
        middleware
      );
      const resultOpenAPI3 = connectRoutesService.mapMiddleware(
        version3Mock.paths['/health/ping'].get['x-middleware'],
        middleware
      );
      expect(resultOpenAPI2).toEqual([options.middleware.healthMiddleware]);
      expect(resultOpenAPI3).toEqual([options.middleware.healthMiddleware]);
    });
  });

  describe('When formatting paths', () => {
    describe('It should return the formatted paths for version 2', () => {
      const { controllers, middleware } = options;
      const { paths } = version3Mock;

      const result = connectRoutesService.formatPaths(paths, controllers, middleware);

      expect(result).toEqual([
        {
          path: '/health/ping',
          operation: 'get',
          controller: controllers.healthController,
          mappedMiddleware: [middleware.healthMiddleware]
        },
        {
          path: '/user/:id',
          operation: 'put',
          controller: controllers.updateUserController,
          mappedMiddleware: [middleware.updateUserMiddleware]
        }
      ]);
    });

    describe('It should return the formatted paths for version 3', () => {
      const { controllers, middleware } = options;
      const { paths } = version2Mock;

      const result = connectRoutesService.formatPaths(paths, controllers, middleware);

      expect(result).toEqual([
        {
          path: '/health/ping',
          operation: 'get',
          controller: controllers.healthController,
          mappedMiddleware: [middleware.healthMiddleware]
        },
        {
          path: '/user/:id',
          operation: 'put',
          controller: controllers.updateUserController,
          mappedMiddleware: [middleware.updateUserMiddleware]
        }
      ]);
    });
  });

  describe('When fetching the Api Version', () => {
    it('should return version number', () => {
      const res = connectRoutesService.getApiVersion(version3Mock);

      expect(res).toEqual(3);
    });

    it('should throw an error if swagger spec is not provided', () => {
      try {
        connectRoutesService.getApiVersion();
      } catch (err) {
        expect(err.message).toEqual('OpenAPI version is not defined');
      }
    });

    it('should throw an error it the arguement is not of type string', () => {
      try {
        connectRoutesService.getApiVersion({ swagger: { test: 'failure' } });
      } catch (err) {
        expect(err.message).toEqual('OpenAPI version is not defined');
      }
    });
  });
});
