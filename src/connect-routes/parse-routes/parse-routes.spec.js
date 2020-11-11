'use strict';

const {
  getApiVersion,
  parseParams,
  getBasePath,
  getBasePathFromServer
} = require('./parse-routes');
const version3Mock = require('../../../mocks/openapi-v3-example.json');

describe('Util', () => {
  describe('When getting the base path from the server', () => {
    it('should extract the path if it is present ', () => {
      const result = getBasePathFromServer(version3Mock);

      expect(result).toEqual(['/api/v1', '/other-url/api/v1']);
    });
  });

  describe('When getting the base path', () => {
    it('should return the base path if using OpenAPI version 2', () => {});

    it('should return the base path if using OpenAPI version 3', () => {
      const result = getBasePath(version3Mock, 3);

      expect(result).toEqual(['/api/v1', '/other-url/api/v1']);
    });

    it('should return an empty string if no version is provided', () => {
      const result = getBasePath();

      expect(result).toEqual('');
    });
  });

  describe('When parsing route params', () => {
    let noParamPath = '/health/ping';
    let paramPath = '/user/{id}';
    let parsedParamPath = '/user/:id';

    it('should return the path if no params found', () => {
      const path = parseParams(noParamPath);

      expect(path).toEqual(noParamPath);
    });

    it('should return the formatted param if present', () => {
      const path = parseParams(paramPath);

      expect(path).toEqual(parsedParamPath);
    });
  });
  describe('When fetching the Api Version', () => {
    it('should return version number', () => {
      const res = getApiVersion(version3Mock);

      expect(res).toEqual(3);
    });

    it('should throw an error if swagger spec is not provided', () => {
      try {
        getApiVersion();
      } catch (err) {
        expect(err.message).toEqual('OpenAPI version is not defined');
      }
    });

    it('should throw an error it the arguement is not of type string', () => {
      try {
        getApiVersion({ swagger: { test: 'failure' } });
      } catch (err) {
        expect(err.message).toEqual('OpenAPI version is not defined');
      }
    });
  });
});
