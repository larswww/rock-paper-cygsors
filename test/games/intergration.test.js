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

      it('status & headers', done => {
        expect(res).to.have.status(201)
        expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
        expect(res).to.have.header('date')
        expect(res).to.have.header('cache-control', 'no-cache')
        done()
      })

      it('body', done => {
        expect(res.body).to.have.property('id')
        expect(res.body).to.have.property('name')
        expect(res.body).to.not.have.property('move')
        done()
      })
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

      it('status', done => {
        expect(res).to.have.status(200)
        done()
      })

      it('body', done => {
        expect(res.body.id).to.equal(id)
        expect(res.body).to.not.have.property('move')
        expect(res.body.message).to.equal(`${playerOne.name} is waiting for move!`)
      })
    })

    it('Should GET a finished game with correct body & headers', async () => {
      const resWithIdForGame = await postOneGame()
      const id = resWithIdForGame.body.id
      await chai.request(url).put(`/api/games/${id}/move`).send(playerTwo)
      const finishedGame = await chai.request(url).get(`/api/games/${id}`)

      it('status & headers', done => {
        expect(finishedGame).to.have.status(200)
        expect(finishedGame).to.have.header('Last-Modified')
        expect(finishedGame).to.have.header('Cache-Control', `max-age=${process.env.MAX_AGE}`)
        done()
      })

      it('body', done => {
        expect(finishedGame.body).to.have.property('message')
        expect(finishedGame.body).to.have.property('playerOne')
        expect(finishedGame.body).to.have.property('playerTwo')
        expect(finishedGame.body.playerOne.name).to.equal(playerOne.name)
        expect(finishedGame.body.playerTwo.name).to.equal(playerTwo.name)
        done()
      })
    })

    it('Should reply 404 for id of correct UUID length but with no game', async () => {
      const idWithNoGame = 'shouldBe32CharsLongLikeUUID12345'
      expect(idWithNoGame.length).to.equal(32)
      const res = await chai.request(url).get(`/api/games/${idWithNoGame}`)

      expect(res).to.have.status(404)
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
      const putPlayerTwoMove = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)

      it('status', done => {
        expect(putPlayerTwoMove).to.have.status(201)
        done()
      })

      it('body', done => {
        expect(putPlayerTwoMove.body).to.have.property('game')
        expect(putPlayerTwoMove.body).to.have.property('playerOne')
        expect(putPlayerTwoMove.body).to.have.property('playerTwo')
        expect(putPlayerTwoMove.body).to.have.property('message')
        expect(putPlayerTwoMove.body.playerOne.outcome).to.equal('WIN')
        expect(putPlayerTwoMove.body.playerTwo.outcome).to.equal('LOSE')
        done()
      })
    })
  })

  describe('Output serialization', async () => {
    /** https://www.fastify.io/docs/latest/Validation-and-Serialization/
     *  Testing that the JSON Schemas in resources/games/schema.js are correctly formated and
     *  prevents bad output as expected
     */

    it('Does not output incomplete games', () => {
      const completeGameIsNotActuallyComplete = {
        hasGame: () => { return true },
        gameIsWaitingForMove: () => { return false },
        isCompleteGame: () => { return true },
        getCompletedGame: () => {
          return {
            // hypothetical scenario where player ones move is shown but playerTwo has no move
            playerOne, // contains {move}
            playerTwo: {
              name: 'Hasnt made move' // no move i.e. game would not yet be finished
            }
          }
        }
      }
      // injectModel will overwrite the default model which is injected in src/games/router.js
      controller.injectModel(completeGameIsNotActuallyComplete)
      it('GET', async () => {
        const res = await chai.request(url).get('/api/games/test')
        expect(res).to.have.status(500)
      })

      it('PUT returning a game where playerTwo is missing', async () => {
        completeGameIsNotActuallyComplete.getCompletedGame = () => {
          return {
            playerOne
          }
        }
        // the data sent is only to satisfy the input validation and wont be used due to the mock
        const res = await chai.request(url).put('/api/games/id/move').send({ name: 'this wont ', move: 'rock' })
        expect(res).to.have.status(500)
      })
    })

    it('Body without game should still pass through', async () => {
      const mock = {
        hasGame: () => { return true },
        gameIsWaitingForMove: () => { return true },
        getPlayerOneName: () => { return 'Lars' }
      }
      controller.injectModel(mock)
      const res = await chai.request(url).get('/api/games/test')
      expect(res).to.have.status(200)
    })
  })
})

async function postOneGame () { return await chai.request(url).post('/api/games').send(playerOne) }
