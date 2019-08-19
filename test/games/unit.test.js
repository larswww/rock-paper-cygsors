const dao = require('../../src/resources/games/dao')
const model = require('../../src/resources/games/model')
const keyv = require('keyv')
const assert = require('chai').assert // https://www.chaijs.com/api/assert/

const playerOne = { name: 'Lars', move: 'rock' }
const playerTwo = { name: 'CeilingCat', move: 'paper' }

describe('Games Unit Tests', () => {
  describe('dao', () => {
    before(async () => {
      await dao.injectDb(new keyv())
    })

    it('Should save an object to memory store', async () => {
      const res = await dao.setGame('testing-id', { playerOne })
      assert.equal(res, true)
    })

    it('Should retrieve a saved object from memory store', async () => {
      await dao.setGame('insert-this-game-id', { playerOne })
      const res = await dao.getGame('insert-this-game-id')
      assert.equal('Lars', res.playerOne.name)
    })

    it('Should return undefined if no game', async () => {
      const res = await dao.getGame('doesntExist')
      assert.equal(res, undefined)
    })
  })

  describe('model', () => {

    it('Should return true vs false if a game is complete', () => {
      let res = model.gameIsComplete(({playerOne, playerTwo, message: 'game is complete'}))
      assert.equal(res, true)

      res = model.gameIsComplete({playerOne: {}, playerTwo: {}, message: {}})
      assert.equal(res, false)

    })


  })


})
