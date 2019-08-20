'use strict'
// https://json-schema.org/
//todo forgot outcome in the schema!
const name = {
  'type': 'string',
  'minLength': 1,
  'maxLength': 100
}

const move = {
  'type': 'string',
  'enum': ['rock', 'paper', 'scissors', 'Rock', 'Paper', 'Scissors', 'ROCK', 'PAPER', 'SCISSORS']
}

const player = {
  'type': 'object',
  'properties': {
    move,
    name
  },
  'required': ['move', 'name']
}

const message = {
  'type': 'string'
}

const id = {
  'type': 'string'
}

const game = {
  'type': 'object',
  'properties': {
    'playerOne': player,
    'playerTwo': player,
  },
  'required': ['playerOne', 'playerTwo']
}

const responseWithGame = {
  'type': 'object',
  'properties': {
    game,
    message,
    id
  },
}

const links = {
  'type': 'object',
  'properties': {
    'href': { 'type': 'string' },
    'rel': { 'type': 'string' },
    'type': {
      'type': 'string',
      'enum': ['PUT']
    }
  }
}

module.exports = { player, responseWithGame, links, message }
