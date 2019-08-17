let games

module.exports = class gamesDao {

  static async injectDb(db) {
    if (games) return
    games = db
  }

  static async setGame(id, game) {
    let saveResult = await games.set(id, game)

    // fastify will respond with 500 if throwing in async function
    // https://www.fastify.io/docs/v1.13.x/Error-Handling/ (see last paragraph)
    if (!saveResult) throw new Error('Unable to create game: try again later')
    return saveResult
  }

  static async getGame(id) {
    return await games.get(id)

  }

  static async updateGame(id, update) {
    let game = await this.getGame(id)
    if (!game) throw new Error('Cannot update: Game not found')
    /**
     * Update comes before game and therefore the update will not overwrite
     * existing values in game. This is so that once a move is set, it wont be
     * overwritten.
     */
    game = {
      ...game,
      ...update
    }
    await this.setGame(id, game)

    return game
  }
}
