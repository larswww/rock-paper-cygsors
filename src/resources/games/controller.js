const uuidv4 = require('uuid/v4')
const gamesDao = require('./dao')
// const rockPaperScissors = require('../../rockPaperScissors')

module.exports.post = async (request, reply) => {
  const { name, move } = request.body
  const id = uuidv4()

  const saveResult = await gamesDao.createGame(id, { name, move })

  /** framework will respond with 500 if throwing in async function
   * https://www.fastify.io/docs/v1.13.x/Error-Handling/
   * see last paragraph
   */
  if (!saveResult) throw new Error('Unable to create game, try again later')

  reply
    .code(201)
    .header('Content-Type', 'application/json')
    .header('Cache-Control', 'no-cache')
    .header('last-modified', new Date().toString())
    .send({ id, name }) // https://www.fastify.io/docs/v1.13.x/Reply/
}
