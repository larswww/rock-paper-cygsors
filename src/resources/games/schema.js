'use strict'
// https://json-schema.org/

const player = {
  'type': 'object',
  'properties': {
    'move': {
      'type': 'string',
      'enum': ['rock', 'paper', 'scissors', 'ROCK', 'PAPER', 'SCISSORS']
    },
    'name': {
      'type': 'string',
      'minLength': 1,
      'maxLength': 100
    },
  },
  'required': ['move', 'name']
}

const game = {
  'type': 'object',
  'properties': {
    'playerOne': player,
    'playerTwo': player,
    'message': { 'type': 'string' }
  }
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

const message = {
  'type': 'string'
}

module.exports = { player, game, links, message }
