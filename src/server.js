const keyv = require('keyv')
const fastify = require('fastify')({ logger: true })

const gamesDao = require('./components/games/dao')

const gamesRouter = require('./components/games/router')
fastify.register(gamesRouter, { prefix: '/api/games'})

const start = async () => {
  try {
     // inject any async db/store connections to DAO's here
    await gamesDao.injectDb(new keyv())
    await fastify.listen(process.env.SERVER_PORT)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
