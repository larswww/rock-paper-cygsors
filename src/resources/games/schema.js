// https://json-schema.org/

const player = {
  "type": "object",
  "properties": {
    "move": {
      "type": "string",
      "enum": ["rock", "paper", "scissors", "ROCK", "PAPER", "SCISSORS"]
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
  },
  "required": ["move", "name"]

}

const result = {
  "result": {
    "type": "string",
    "enum": ["WIN", "LOSE", "TIE"]
  }
}

const game = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Game",
  "description": "Return object for a finished rock paper scissors game",
  "type": "object",
  "properties": {
    "playerOne": {
      ...player,
      ...result
    },
    "playerTwo": {
      ...player,
      ...result
    },
    "message": {
      "type": "string",
      "minLength": 1,
    }
  }

}

const schema = {}

module.exports = { game, schema, player }
