const chai = require('chai') // https://www.chaijs.com/api/
const chaiHttp = require('chai-http') // https://www.chaijs.com/plugins/chai-http/
chai.use(chaiHttp)
const expect = chai.expect // https://www.chaijs.com/api/bdd/

let url

const playerOne = { name: 'Lars', move: 'rock' }
const playerTwo = { name: 'KeyboardCat', move: 'scissors' }
const validUuid = 'SHOULDBe32CharsLongLikeUUID12345'

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
      expect(res).to.have.header('last-modified')
      expect(res).to.have.header('cache-control', 'no-cache')

      expect(res.body).to.have.property('id')
      expect(res.body).to.have.property('name')
      expect(res.body).to.not.have.property('move')
    })

    it('Should return status 400 if body is bad input or missing', async () => {
      let res = await chai.request(url).post('/api/games').send({})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({name: 'Lars'})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({move: 'rock'})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({name: 'Lars', move: 'rck'})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({name: '', move: 'rock'})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({name: true, move: true})
      expect(res).to.have.status(400)

      res = await chai.request(url).post('/api/games').send({name: null, move: null})
      expect(res).to.have.status(400)

    })
  })

  describe('GET', async () => {

    it('Should GET a game based on ID and return a correct reply', async () => {
      let resWithIdForGame = await postOneGame()
      let id = resWithIdForGame.body.id

      let res = await chai.request(url).get(`/api/games/${id}`)
      expect(res).to.have.status(200)
      expect(res.body.id).to.equal(id)
      expect(res.body).to.not.have.property('move')
      expect(res.body.message).to.equal(`${playerOne.name} is waiting for opponent!`)
    })

    it('Should GET a finished game with message and player objects', async () => {
      let resWithIdForGame = await postOneGame()
      let id = resWithIdForGame.body.id
      await chai.request(url).put(`/api/games/${id}/move`).send(playerTwo)

      let finishedGame = await chai.request(url).get(`/api/games/${id}`)
      expect(finishedGame).to.have.status(200)
      expect(finishedGame.body).to.have.property('message')
      expect(finishedGame.body).to.have.property('playerOne')
      expect(finishedGame.body).to.have.property('playerTwo')
      expect(finishedGame.body.playerOne.name).to.equal(playerOne.name)
      expect(finishedGame.body.playerTwo.name).to.equal(playerTwo.name)
    })

    it('Should reply 404 for id of correct UUID length but with no game', async () => {
      let idWithNoGame = 'shouldBe32CharsLongLikeUUID12345'
      expect(idWithNoGame.length).to.equal(32)
      let res = await chai.request(url).get(`/api/games/${idWithNoGame}`)
      expect(res).to.have.status(404)
    })

  })


  describe('PUT', async () => {

    it('Should be idempotent i.e. subsequent repeat calls code is 200 not 201', async () => {
      let game = await postOneGame()
      let putPlayerTwoMove = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)
      expect(putPlayerTwoMove).to.have.status(201)
      let identicalCall = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)
      expect(identicalCall).to.have.status(200)
    })

    it('Should return game result after PUT correct input to existing game', async () => {
      let game = await postOneGame()
      let putPlayerTwoMove = await chai.request(url).put(`/api/games/${game.body.id}/move`).send(playerTwo)
      expect(putPlayerTwoMove).to.have.status(201)
      expect(putPlayerTwoMove.body).to.have.property('playerOne')
      expect(putPlayerTwoMove.body).to.have.property('playerTwo')
      expect(putPlayerTwoMove.body).to.have.property('message')
      expect(putPlayerTwoMove.body.playerOne.outcome).to.equal('WIN')
      expect(putPlayerTwoMove.body.playerTwo.outcome).to.equal('LOSE')
    })

  })


})

async function postOneGame() { return await chai.request(url).post('/api/games').send(playerOne) }
