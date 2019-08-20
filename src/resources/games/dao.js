'use strict'
let games

/**
 * gamesDao is not async when using local in memory store i.e. 'new keyv()'
   - it is written as async anyway. So that if 'new keyv()' is passed a dynamoDb
 or Redis connection, and everything will still work in production without further changes
 */

module.exports = class gamesDao {
  static async injectDb (db) {
    if (games) return
    games = db
  }

  static async setGame (id, game) {
    const saveResult = await games.set(id, game)

    // fastify will respond with 500 if throwing in async function
    // https://www.fastify.io/docs/v1.13.x/Error-Handling/ (see last paragraph)
    if (!saveResult) throw new Error('Unable to create game: try again later')
    return saveResult
  }

  static async getGame (id) {
    return await games.get(id)
  }

  static async updateGame (id, update) {
    let game = await this.getGame(id)
    if (!game) throw new Error('Cannot update: Game not found')

    game = {
      ...game,
      ...update // i.e. update overwrites existing keys in game
    }
    await this.setGame(id, game)
    return game
  }
}
