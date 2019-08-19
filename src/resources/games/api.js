'use strict'
const games = require('./model')
const uuidv4 = require('uuid/v4')

module.exports.post = async (request, reply) => {
  reply // https://www.fastify.io/docs/v1.13.x/Reply/
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')
  const { name, move } = request.body
  const id = uuidv4()

  await games.setGame(id, { name, move })

  return {
    id, name,
    links: {
      'href': `${id}/move`,
      'rel': 'games',
      'type': 'PUT'
    }
  }
}

module.exports.put = async (request, reply) => {
  reply.header('Content-Type', 'application/json')
  reply.header('Cache-Control', 'no-cache')
  const { id } = request.params
  const { name, move } = request.body

  const gameExists = await games.hasGame(id)
  if (!gameExists) {
    reply.code(404)
    return { message: `No game with id ${id}` } // put in base class with `No ${resource.name} with ${id}
  }

  const shouldFinishStartedGame = await games.gameIsWaitingForMove(id)
  if (shouldFinishStartedGame) {
    let game = await games.completeGame(id, { name, move })
    reply.code(201)
    return game
  }

  const shouldReturnSavedGame = await games.isCompleteGame(id)
  if (shouldReturnSavedGame) { // todo is this good
    let game = await games.getCompleteGame(id)
    reply.code(200)
    return game
  }

}

module.exports.get = async (request, reply) => {
  const { id } = request.params

  const gameExists = await games.hasGame(id)
  if (!gameExists) {
    reply.code(404)
    return { message: `No game with id ${id}` } // put in base class with `No ${resource.name} with ${id}
  }

  reply.code(200)
    .header('Content-Type', 'application/json')

  const shouldSendPlayerWaitingMessage = await games.gameIsWaitingForMove(id)
  if (shouldSendPlayerWaitingMessage) {
    reply.header('Cache-Control', 'no-cache')
    const playerOneName = await games.getPlayerOneName(id)
    return { message: `${playerOneName} is waiting for move!`, id }
  }

  const game = await games.getCompleteGame(id)
  reply
    .header('Last-Modified', game.lastModified)
    .header('Cache-Control', `max-age=${process.env.MAX_AGE}`)
  return game
}

