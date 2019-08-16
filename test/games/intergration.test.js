const chai = require('chai') // https://www.chaijs.com/api/
const chaiHttp = require('chai-http') // https://www.chaijs.com/plugins/chai-http/
const expect = chai.expect // https://www.chaijs.com/api/bdd/

let url
chai.use(chaiHttp)

// https://mochajs.org/#features
describe('Games Intergration Tests', async () => {
  before(async () => {
    require('../../src/index')
    url = `http://localhost:${process.env.SERVER_PORT}`

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

    it('Should return 400 BAD REQUEST if body is incorrect or missing', async () => {
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

    })
  })

  describe('GET', async () => {

    it('Should GET a game based on ID', async () => {
      let resWithIdForGame = await chai.request(url).post('/api/games').send({ name: 'Lars', move: 'rock' })
      let id = resWithIdForGame.body.id

      let res = await chai.request(url).get(`/api/games/${id}`)
      expect(res).to.have.status(200)

    })

  })


})
