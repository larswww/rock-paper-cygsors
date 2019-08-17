const uuidv4 = require('uuid/v4') // https://www.npmjs.com/package/uuid
const gamesDao = require('./dao')
const rockPaperScissors = require('sten-sax-pase')

module.exports.post = async (request, reply) => {
  const { name, move } = request.body
  const id = uuidv4()

  const saveResult = await gamesDao.setGame(id, {playerOne: { name, move }})

  reply // https://www.fastify.io/docs/v1.13.x/Reply/
    .code(201)
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')
    .header('last-modified', new Date().toString())
    .send({ id, name })
}

module.exports.put = async (request, reply) => {
  const { id } = request.params
  const { name, move } = request.body

  const savedGame = await gamesDao.getGame(id)
  if (!savedGame) return reply.code(404).send({message: `No game with id ${id}`})

  let { playerOne, playerTwo, message } = savedGame
  if (playerOne && playerTwo && message) return reply.code(200).send(savedGame)

  playerTwo = { name, move }
  playerOne.outcome = rockPaperScissors.play(playerOne.move, playerTwo.move)
  playerTwo.outcome = rockPaperScissors.play(playerTwo.move, playerOne.move)
  message = rockPaperScissors.message(playerOne, playerTwo)

  const gameResult = { playerOne, playerTwo, message }
  await gamesDao.updateGame(id, gameResult)

  return reply
    .code(201)
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')
    .send(gameResult)
}

module.exports.get = async (request, reply) => {
  const { id } = request.params

  const savedGame = await gamesDao.getGame(id)
  if (!savedGame) return reply.code(404).send({message: `No game with id ${id}`})

  if (!savedGame.message) {
    return reply
      .code(200)
      .header('Cache-Control', 'no-cache')
      .header('Content-Type', 'application/json')
      .send({message: `${savedGame.playerOne.name} is waiting for opponent!`, id})
  }

  if (savedGame.message) {
    return reply
      .code(200)
      .header('Cache-Control', process.env.TTL)
      .header('Content-Type', 'application/json')
      .send(savedGame)
  }

}
