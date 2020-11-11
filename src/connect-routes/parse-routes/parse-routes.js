'use strict';

const { get } = require('lodash');
const { URL } = require('url');

exports.recursiveSearch = (obj, key) => {
  let val = null;

  Object.keys(obj).some((k) => {
    if (k === key) {
      val = obj[k];
      return true;
    }

    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      val = this.recursiveSearch(obj[k], key);
      return val !== undefined;
    }
  });

  return val;
};

exports.getBasePathFromServer = (openapi) => {
  const servers = get(openapi, 'servers');

  if (!servers || !Array.isArray(servers) || servers.length < 1) {
    return [''];
  }

  const basePaths = servers.reduce((acc, cur) => {
    if (get(cur, 'url') && get(cur, 'url').search('http') !== -1) {
      const url = new URL(get(cur, 'url'));
      return acc.add(url.pathname);
    }

    if (get(cur, 'url')) {
      return acc.add(get(cur, 'url'));
    }
    return acc;
  }, new Set());

  console.log([...basePaths]);
  return [...basePaths];
};

exports.getBasePath = (openapi, openApiVersion) => {
  if (openApiVersion === 2) {
    return [get(openapi, 'basePath', '')];
  }

  if (openApiVersion === 3) {
    return this.getBasePathFromServer(openapi);
  }

  return '';
};

exports.parseParams = (path) => {
  const paramIndex = path.indexOf('{');

  if (paramIndex === -1) {
    return path;
  }

  const basePath = path.substr(0, paramIndex);
  const param = path.substr(paramIndex).replace(/[{}]/g, '');

  return `${basePath}:${param}`;
};

exports.mapMiddleware = (routeMiddleware, middleware) => {
  if (!middleware && !routeMiddleware) {
    return [];
  }

  if (routeMiddleware.length > 0 && !middleware) {
    throw new Error(
      'Middleware defined in OpenAPI definition but no middleware provided in options'
    );
  }

  const mappedMiddleware = new Set();

  if (middleware) {
    routeMiddleware.forEach((rmw) => {
      const mpMw = this.recursiveSearch(middleware, rmw);

      // const mpMw = middleware[rmw];

      if (!mpMw) {
        throw new Error(
          `Middleware: ${rmw}: defined in OpenAPI definition but not provided in options`
        );
      }

      mappedMiddleware.add(mpMw);
    });
  }

  return [...mappedMiddleware];
};

exports.formatPaths = (paths, controllers, middleware) => {
  const formattedPaths = [];

  Object.keys(paths).forEach((pathsKey) => {
    Object.keys(paths[pathsKey]).forEach((pathKey) => {
      const operationId = paths[pathsKey][pathKey]['operationId'];
      const mappedMiddleware = this.mapMiddleware(
        paths[pathsKey][pathKey]['x-middleware'],
        middleware
      );
      
      const controller = this.recursiveSearch(controllers, operationId);

      if(!controller) {
        throw new Error(`No controller found for ${pathsKey}/${pathKey} which matches operationId: ${operationId}`)
      }

      const formattedPath = {
        path: this.parseParams(pathsKey),
        operation: pathKey,
        controller,
        mappedMiddleware
      };
      formattedPaths.push(formattedPath);
    });
  });

  return formattedPaths;
};

exports.getApiVersion = (openapi) => {
  let openapiVersion = get(openapi, 'swagger');

  if (!openapiVersion) {
    openapiVersion = get(openapi, 'openapi');
  }

  if (!openapiVersion || typeof openapiVersion !== 'string') {
    throw new Error('OpenAPI version is not defined');
  }

  return +openapiVersion.charAt(0);
};
