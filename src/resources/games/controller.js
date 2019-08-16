const uuidv4 = require('uuid/v4')
const gamesDao = require('./dao')
// const rockPaperScissors = require('../../rockPaperScissors')

module.exports.post = (request, reply) => {
  console.log('post')
  const id = uuidv4()

  const saveResult = gamesDao.createGame(id, request.body)

  // insertOne
  // if already exists, how does a mongo error look like?
  reply.send({id, saveResult})
}
