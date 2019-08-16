
let games

module.exports = class gamesDao {

  static async injectDb(db) {
    if (games) return
    games = db
  }

  static async createGame(id, game) {
    return await games.set(id, game)
  }


  static async getGame(id) {
    return await games.get(id)

  }



}
