const controller = require('./controller')


module.exports = function (fastify, opts, next) {

  fastify.get('/:id', {}, controller.get)

  fastify.post('/', {}, controller.post)

  fastify.put('/:id/move', {}, controller.put)

  next()
}
