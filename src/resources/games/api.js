'use strict'
const uuidv4 = require('uuid/v4')
let games

module.exports = class gamesApi {
  static injectModel (model) {
    games = model
  }

  static async POST (request, reply) {
    // https://www.fastify.io/docs/v1.13.x/Reply/
    reply.header('Content-Type', 'application/json')
      .header('Cache-Control', 'no-cache')
    const { name, move } = request.body
    const id = uuidv4()

    await games.setGame(id, { name, move })
    const links = getHateoasLink(id)
    return { id, name, links }
  }

  static async PUT (request, reply) {
    reply.header('Content-Type', 'application/json')
      .header('Cache-Control', 'no-cache')
    const { id } = request.params
    const { name, move } = request.body

    const gameExists = await games.hasGame(id)
    if (!gameExists) {
      reply.code(404)
      return { message: `No game with id ${id}` } // put in base class with `No ${resource.name} with ${id}
    }

    const shouldFinishStartedGame = await games.gameIsWaitingForMove(id)
    if (shouldFinishStartedGame) {
      const game = await games.completeGame(id, { name, move })
      reply.code(201)
      return { game }
    }

    const shouldReturnSavedGame = await games.isCompletedGame(id)
    if (shouldReturnSavedGame) {
      const game = await games.getCompletedGame(id)
      reply.code(200)
      return { game }
    }
  }

  static async GET (request, reply) {
    const { id } = request.params

    const gameExists = await games.hasGame(id)
    if (!gameExists) {
      reply.code(404)
      return { message: `No game with id ${id}` }
    }

    reply.code(200)
      .header('Content-Type', 'application/json')

    const shouldSendPlayerWaitingMessage = await games.gameIsWaitingForMove(id)
    if (shouldSendPlayerWaitingMessage) {
      reply.header('Cache-Control', 'no-cache')
      const playerOneName = await games.getPlayerOneName(id)
      const links = getHateoasLink(id)
      const message = `${playerOneName} is waiting for move!`
      return { message, id, links }
    }

    const completeGame = await games.getCompletedGame(id)
    reply
      .header('Last-Modified', completeGame.lastModified)
      .header('Cache-Control', `max-age=${process.env.MAX_AGE}`)
    return { game: completeGame }
  }
}

function getHateoasLink (id) {
  return {
    href: `${id}/move`,
    rel: 'games',
    type: 'PUT'
  }
}
