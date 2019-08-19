'use strict'
const keyv = require('keyv') // https://github.com/lukechilds/keyv
const fastify = require('fastify')() // https://www.fastify.io/docs/v1.13.x/Getting-Started/
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
        - it is implemented as async anyway. So if new keyv() is passed a dynamoDb
          or Redis connection everything will work in production without further changes

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
