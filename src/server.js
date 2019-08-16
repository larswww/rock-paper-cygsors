const keyv = require('keyv') //https://github.com/lukechilds/keyv
const fastify = require('fastify')({ logger: true }) //https://www.fastify.io/docs/v1.13.x/Getting-Started/

const gamesDao = require('./resources/games/dao')

const gamesRouter = require('./resources/games/router')
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
