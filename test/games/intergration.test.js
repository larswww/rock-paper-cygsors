const chai = require('chai') // https://www.chaijs.com/api/
const chaiHttp = require('chai-http') // https://www.chaijs.com/plugins/chai-http/
chai.use(chaiHttp)
const expect = chai.expect // https://www.chaijs.com/api/bdd/
let url

const controller = require('../../src/resources/games/api') // for injecting mock of model
const playerOne = { name: 'Lars', move: 'rock' }
const playerTwo = { name: 'KeyboardCat', move: 'scissors' }

// https://mochajs.org/#features
describe('Games Intergration Tests', async () => {
  before(async () => {
    require('../../src/index')
    url = `http://localhost:${process.env.SERVER_PORT}` // to run test suite against production change this to prod url
  })

  describe('POST', async () => {
    it('Should create a new game returning correct body and correct REST response', async () => {
      const res = await chai.request(url).post('/api/games').send({ name: 'Lars', move: 'rock' })

      expect(res).to.have.status(201)
      expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
      expect(res).to.have.header('date')
      expect(res).to.have.header('cache-control', 'no-cache')

      expect(res.body).to.have.property('id')
      expect(res.body).to.have.property('name')
      expect(res.body).to.have.property('links')

      expect(res.body).to.not.have.property('move')
    })

    it('Should return status 400 if body is bad input or missing', async () => {
      let res = await chai.request(url).post('/api/games').send({})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ name: 'Lars' })
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ move: 'rock' })
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ name: 'Lars', move: 'rck' })
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ name: '', move: 'rock' })
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ name: true, move: true })
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({ name: null, move: null })
      expect(res).to.have.status(400)
    })
  })

  describe('GET', async () => {
    it('Should GET a game based on ID and return "waiting for opponent" message if game is not finished', async () => {
      const resWithIdForGame = await postOneGame()
      const id = resWithIdForGame.body.id
      const res = await chai.request(url).get(`/api/games/${id}`)

      expect(res).to.have.status(200)

      expect(res.body.id).to.equal(id)
      expect(res.body).to.not.have.property('move')
      expect(res.body.message).to.equal(`${playerOne.name} is waiting for move!`)
    })

    it('Should GET a finished game with correct body & headers', async () => {
      const resWithIdForGame = await postOneGame()
      const id = resWithIdForGame.body.id
      expect(id.length).to.equal(36)
      await chai.request(url).put(`/api/games/${id}/move`).send(playerTwo)
      const res = await chai.request(url).get(`/api/games/${id}`)

      expect(res).to.have.status(200)
      expect(res).to.have.header('Last-Modified')
      expect(res).to.have.header('Cache-Control', `max-age=${process.env.MAX_AGE}`)

      expect(res.body).to.have.property('game')
      expect(res.body.game).to.have.property('playerOne')
      expect(res.body.game).to.have.property('playerTwo')
      expect(res.body.game.playerOne.name).to.equal(playerOne.name)
      expect(res.body.game.playerTwo.name).to.equal(playerTwo.name)
    })
  })

  describe('PUT', async () => {
    it('Should be idempotent i.e. subsequent repeat calls code is status 200 not 201', async () => {
      const game = await postOneGame()
      const res = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)
      expect(res).to.have.status(201)
      const identicalCall = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)
      expect(identicalCall).to.have.status(200)
    })

    it('Should return game result after PUT correct input to existing game', async () => {
      const game = await postOneGame()
      const res = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)

      expect(res).to.have.status(201)

      expect(res.body).to.have.property('game')
      expect(res.body.game).to.have.property('playerOne')
      expect(res.body.game).to.have.property('playerTwo')
      expect(res.body.game).to.have.property('message')
      expect(res.body.game.playerOne.outcome).to.equal('WIN')
      expect(res.body.game.playerTwo.outcome).to.equal('LOSE')
    })
  })

  describe('Output serialization', async () => {
    /** https://www.fastify.io/docs/latest/Validation-and-Serialization/
     *  Testing that the JSON Schemas in resources/games/schema.js are correctly formated and
     *  prevents bad output as expected.
     */

    describe('Does not output incomplete games', () => {
      const completeGameIsNotActuallyComplete = {
        hasGame: () => { return true },
        gameIsWaitingForMove: () => { return false },
        isCompletedGame: () => { return true },
        getCompletedGame: () => {
          return {
            // hypothetical scenario where player ones move is shown but playerTwo has no move
            playerOne, // contains {move}
            playerTwo: {
              name: 'Hasnt made move' // no {move} i.e. game would not yet be finished
            }
          }
        }
      }

      it('GET', async () => {
        controller.injectModel(completeGameIsNotActuallyComplete)
        const res = await chai.request(url).get('/api/games/test')
        expect(res).to.have.status(500)
      })

      it('PUT returning a game where playerTwo is missing', async () => {
        completeGameIsNotActuallyComplete.getCompletedGame = () => {
          return {
            playerOne
          }
        }
        controller.injectModel(completeGameIsNotActuallyComplete)

        // the data sent is only to satisfy the input validation and wont be used due to the mock
        const res = await chai.request(url).put('/api/games/id/move').send({ name: 'this wont ', move: 'rock' })
        expect(res).to.have.status(500)
        expect(res.body.message).to.be.equal('playerTwo is required!')
      })
    })

    describe('Does not prevent links, message and id from being returned', () => {
      it('Body without game should still pass through', async () => {
        const mock = {
          hasGame: () => { return true },
          gameIsWaitingForMove: () => { return true },
          getPlayerOneName: () => { return 'Lars' }
        }
        controller.injectModel(mock)
        const res = await chai.request(url).get('/api/games/test')
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('message')
        expect(res.body).to.have.property('id')
        expect(res.body).to.have.property('links')
      })
    })
  })
})

async function postOneGame () { return await chai.request(url).post('/api/games').send(playerOne) }
