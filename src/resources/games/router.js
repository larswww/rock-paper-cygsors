'use strict'
const controller = require('./api')
const model = require('./model')
controller.injectModel(model)
const { player, links, game, message, id } = require('./schema')

module.exports = function (fastify, opts, next) {
  fastify.post('/', {
    schema: { // https://www.fastify.io/docs/v1.13.x/Validation-and-Serialization/
      body: player
    }
  }, controller.POST)

  fastify.get('/:id', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            game,
            message,
            links,
            id
          }
        }
      }
    }
  }, controller.GET)

  fastify.put('/:id/move', {
    schema: {
      body: player,
      response: {
        '2xx': {
          type: 'object',
          properties: {
            game,
            message,
            links,
            id
          }
        }
      }
    }
  }, controller.PUT)

  next()
}
