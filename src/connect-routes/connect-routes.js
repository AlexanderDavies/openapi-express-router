const { getApiVersion, formatPaths, getBasePath } = require('./parse-routes');

exports.connectRoutes = (openapi, options = {}) => {
  if (typeof openapi !== 'object' || Array.isArray(openapi)) {
    throw new Error('No OpenAPI definition!');
  }

  if (!options.controllers) {
    throw new Error('No controllers have been defined!');
  }

  const { paths = null } = openapi;

  if (!paths) {
    throw new Error('No paths have been defined!');
  }

  const { controllers, middleware = null } = options;

  const formattedPaths = formatPaths(paths, controllers, middleware);

  const openapiVersion = getApiVersion(openapi);

  const basePaths = getBasePath(openapi, openapiVersion);

  return (app) => {
    basePaths.forEach((basePath) => {
      formattedPaths.forEach(({ operation, path, mappedMiddleware, controller }) => {
        const functions = [...mappedMiddleware, controller];
        app[operation](`${basePath}${path}`, ...functions);
      });
    });
    return app;
  };
};
