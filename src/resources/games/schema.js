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


module.exports = { player }
