'use strict'
const keyv = require('keyv') // https://github.com/lukechilds/keyv
// https://www.fastify.io/docs/v1.13.x/Getting-Started/
// https://www.fastify.io/docs/latest/Logging/
const fastify = require('fastify')({
  ignoreTrailingSlash: true,
  logger: true // https://github.com/fastify/fastify/blob/master/docs/Logging.md
})
const rateLimit = require('fastify-rate-limit')

if (process.env.NODE_ENV === 'development') {
  const cors = require('cors') // saved as a dev dependency in package.json
  fastify.use(cors())
  fastify.options('*', (request, reply) => { reply.send() })
}

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

const gamesDao = require('./resources/games/dao')

const gamesRouter = require('./resources/games/router')
fastify.register(gamesRouter, { prefix: '/api/games' })

const start = async () => {
  try {
    // If adding other resources with async dependencies i.e. db connections etc and similar inject them here
    await gamesDao.injectDb(new keyv())
    await fastify.listen(process.env.SERVER_PORT)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
