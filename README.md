# OPENAPI-EXPRESS-ROUTER

An simple Node library to build and connect Express routes based on an OpenAPI version 2 or 3 spec.

# Basic Usage

    const express = require('express');
    const { connectRoutes } = require('openapi-express-router');
    const controllers = require('./api/controllers.js);
    const middleware = require('./api/middleware.js);

    app = express();

    const options = {
        controllers,
        middleware
    };

    const connect = connectRoutes(openApiMock, options);

    connect(app);

# Controllers

Controllers are uniquely identified in the Swagger 2 or OpenAPI 3 specification by the x-request-id i.e. the operationId must match the name of the controller.

    "paths": {
        "/health/ping": {
            "get": {
                "summary": "Health check route",
                "description": "Returns pong if the server is healthy",
                "operationId": "healthController"
            }
        }
    }

Controllers are connected via the options object and can be nested at any level e.g.

    const options = {
        controllers: {
            healthController = (req, res, next) => res.status(200).json({message: req.body.message})
        }
    }

    // OR

    const options = {  
        controllers: {
            nestedControllers: {
                healthController = (req, res, next) => res.status(200).json({message: req.body.message})
            }
        }
    }

If no controller is found which matches the operationId following error will be thrown:
`No controller found for ${pathsKey}/${pathKey} which matches operationId: ${operationId}`

# Middleware

Middleware functions are optional but can be added to the Swagger 2 or OpenAPI 3 spec using the x-middleware array property.

    "/health/ping": {
        "get": {
            "summary": "Health check route",
            "description": "Returns pong if the server is healthy",
            "operationId": "healthController",
            "x-middleware": [
                "healthMiddleware"
            ],
        }
    }

Like controllers, middleware are connected via the options object and can be nested at any level e.g.

    const options = {  
        middleware: {
            nestedMiddleware: {
                healthMiddleware = (req, res, next) => {
                    req.body.message = 'pong';
                    next();
                }
            }
        }
    }