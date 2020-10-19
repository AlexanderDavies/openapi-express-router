const { get } = require('lodash');
const { URL } = require('url');

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
      const mpMw = middleware[rmw];

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

      const formattedPath = {
        path: this.parseParams(pathsKey),
        operation: pathKey,
        controller: controllers[operationId],
        mappedMiddleware: mappedMiddleware
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
