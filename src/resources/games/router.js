'use strict'
const controller = require('./api')
const { player, game } = require('./schema')

module.exports = function (fastify, opts, next) {
  fastify.post('/', {
    // https://www.fastify.io/docs/v1.13.x/Validation-and-Serialization/
    schema: {
      body: player
    }
  }, controller.post)

  fastify.get('/:id',controller.get)

  fastify.put('/:id/move', controller.put)

  next()
}
