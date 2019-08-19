'use strict'
const keyv = require('keyv') // https://github.com/lukechilds/keyv
// https://www.fastify.io/docs/v1.13.x/Getting-Started/
const fastify = require('fastify')({ logger: true }) // pass { logger: true } to enable logging to console
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
    /* gamesDao is not async when using local in memory store i.e. 'new keyv()'
        - it is treated as as async anyway. So that if 'new keyv()' can be passed a dynamoDb
          or Redis connection, and everything will work in production without further changes

       If adding other resources with async dependencies inject them here first as with gamesDao
     */
    await gamesDao.injectDb(new keyv())
    await fastify.listen(process.env.SERVER_PORT)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
