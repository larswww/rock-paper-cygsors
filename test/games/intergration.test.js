const chai = require('chai') // https://www.chaijs.com/api/
const chaiHttp = require('chai-http') // https://www.chaijs.com/plugins/chai-http/
const expect = chai.expect // https://www.chaijs.com/api/bdd/

const url = `http://localhost:${process.env.SERVER_PORT}`

chai.use(chaiHttp)

// https://mochajs.org/#features
describe('Games Intergration Tests', async () => {
  before(async () => {
    require('../../src/server')
  })

  describe('POST', async () => {
    it('Should create a new game returning correct body and correct REST response', async () => {
      const res = await chai.request(url).post('/api/games').send({ name: 'Lars', move: 'rock' })
      expect(res).to.have.status(201)
      expect(res).to.have.header('content-type', 'application/json')
      expect(res).to.have.header('date')
      expect(res).to.have.header('last-modified')
      expect(res).to.have.header('cache-control', 'no-cache')
    })
  })
})
