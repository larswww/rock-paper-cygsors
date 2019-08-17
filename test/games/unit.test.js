const gamesDao = require('../../src/resources/games/dao')
const keyv = require('keyv')
const assert = require('chai').assert //https://www.chaijs.com/api/assert/

const playerOne = {name: 'Lars', move: 'rock'}
const playerTwo = {name: 'CeilingCat', move: 'paper'}

describe('Games Unit Tests', () => {

  describe('Games.dao', () => {

    before(async () => {
      await gamesDao.injectDb(new keyv())
    })

    it('Should save an object to memory store', async () => {
      let res = await gamesDao.setGame('testing-id', { playerOne })
      assert.equal(res, true)
    })

    it('Should retrieve a saved object from memory store', async () => {
      await gamesDao.setGame('insert-this-game-id', { playerOne })
      let res = await gamesDao.getGame('insert-this-game-id')
      assert.equal('Lars', res.playerOne.name)
    })

    it('Should return undefined if no game', async () => {
      let res = await gamesDao.getGame('doesntExist')
      assert.equal(res, undefined)
    })

  })


})

