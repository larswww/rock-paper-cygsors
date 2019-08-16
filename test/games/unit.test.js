const gamesDao = require('../../src/resources/games/dao')
const keyv = require('keyv')
const assert = require('chai').assert //https://www.chaijs.com/api/assert/

describe('Games Unit Tests', () => {

  describe('Games.dao', () => {

    before(async () => {
      await gamesDao.injectDb(new keyv())
    })

    it('Should save an object to memory store', async () => {
      let res = await gamesDao.createGame('testing-id', {name: 'Lars', move: 'rock'})
      assert.equal(true, res)
    })

    it('Should retrieve a saved object from memory store', async () => {
      await gamesDao.createGame('insert-this-game-id', {name: 'Lars', move: 'rock'})
      let game = await gamesDao.getGame('insert-this-game-id')
      assert.equal('Lars', game.name)
    })





  })


  describe('Games.controller', () => {

  })


})

