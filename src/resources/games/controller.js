const uuidv4 = require('uuid/v4') // https://www.npmjs.com/package/uuid
const gamesDao = require('./dao')
const rockPaperScissors = require('sten-sax-pase')

module.exports.post = async (request, reply) => {
  const { name, move } = request.body
  const id = uuidv4()

  await gamesDao.setGame(id, { playerOne: { name, move } })

  reply.code(201) // https://www.fastify.io/docs/v1.13.x/Reply/
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')

  return {
    id,
    name,
    links: {
      "href": `${id}/move`,
      "rel": "games",
      "type": "PUT"
    }
  }
}

module.exports.put = async (request, reply) => {
  const { id } = request.params

  const savedGame = await gamesDao.getGame(id)
  if (!savedGame) {
    reply.code(404)
    return { message: `No game with id ${id}` }
  }

  let { playerOne, playerTwo, message } = savedGame
  const gameIsAlreadyComplete = playerOne && playerTwo && message
  if (gameIsAlreadyComplete) {
    reply.code(200)
    return savedGame
  }

  const { name, move } = request.body
  playerTwo = { name, move }
  playerOne.outcome = rockPaperScissors.play(playerOne.move, playerTwo.move)
  playerTwo.outcome = rockPaperScissors.play(playerTwo.move, playerOne.move)
  message = rockPaperScissors.message(playerOne, playerTwo)

  const gameResult = { playerOne, playerTwo, message }
  await gamesDao.updateGame(id, { ...gameResult, lastModified: new Date().toString() })

  reply
    .code(201)
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')
  return gameResult
}

module.exports.get = async (request, reply) => {
  const { id } = request.params

  const savedGame = await gamesDao.getGame(id)
  if (!savedGame) {
    reply.code(404)
    return { message: `No game with id ${id}` }
  }

  reply.code(200)
    .header('Cache-Control', 'no-cache')
    .header('Content-Type', 'application/json')

  const gameIsStillWaitingForSecondMove = !savedGame.message
  if (gameIsStillWaitingForSecondMove) {
    return { message: `${savedGame.playerOne.name} is waiting for opponent!`, id }
  } else {
    reply
      .header('Last-Modified', savedGame.lastModified)
      .header('Cache-Control', `max-age=${process.env.MAX_AGE}`)
    return savedGame
  }
}
