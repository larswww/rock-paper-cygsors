'use strict'
const keyv = require('keyv') // https://github.com/lukechilds/keyv
// https://www.fastify.io/docs/v1.13.x/Getting-Started/
// https://www.fastify.io/docs/latest/Logging/
// add/remove { logger: true } to require('fastify')({ logger: true}) to enable logging to console
const fastify = require('fastify')({
  ignoreTrailingSlash: true,
  logger: true
})
const rateLimit = require('fastify-rate-limit')

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
