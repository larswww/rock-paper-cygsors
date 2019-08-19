'use strict'
const gamesDao = require('./dao')
const rockPaperScissors = require('sten-sax-pase')

module.exports = class Games {

  static async setGame (id, { name, move }) {
    return await gamesDao.setGame(id, { playerOne: { name, move } })
  }

  static async getGame (id) {
    return await gamesDao.getGame(id)
  }

  static async hasGame (id) {
    let game = await this.getGame(id)
    return !!game
  }

  static async completeGame (id, playerTwo) {
    const { playerOne } = await this.getGame(id)
    playerOne.outcome = rockPaperScissors.play(playerOne.move, playerTwo.move)
    playerTwo.outcome = rockPaperScissors.play(playerTwo.move, playerOne.move)
    const message = rockPaperScissors.message(playerOne, playerTwo)
    const game = { playerOne, playerTwo, message, lastModified: new Date().toString() }
    await gamesDao.updateGame(id, game)
    return game
  }

  static gameIsComplete({ playerOne, playerTwo, message }) {
    return !!(playerOne.move && playerTwo.move && message)
  }

  static async isCompletedGame(id) {
    const game = await this.getGame(id)
    return this.gameIsComplete(game)
  }

  static async getCompletedGame(id) {
    const game = await this.getGame(id)
    if (!this.gameIsComplete(game)) throw new Error('Game not complete')
    return game
  }

  static async gameIsWaitingForMove(id) {
    const { playerTwo } = await this.getGame(id)
    return !playerTwo
  }

  static async getPlayerOneName(id) {
    const { playerOne } = await this.getGame(id)
    if (!playerOne) throw Error('Player not found')
    return playerOne.name || ''
  }

}

