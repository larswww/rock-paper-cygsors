'use strict'
// https://json-schema.org/
const name = {
  'type': 'string',
  'minLength': 1,
  'maxLength': 100
}

const move = {
  'type': 'string',
  'enum': ['rock', 'paper', 'scissors', 'Rock', 'Paper', 'Scissors', 'ROCK', 'PAPER', 'SCISSORS']
}

const outcome = {
  'type': 'string',
  'enum': ['WIN', 'TIE', 'LOSE']
}

const player = {
  'type': 'object',
  'properties': {
    move,
    name,
    outcome
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
    message
  },
  'required': ['playerOne', 'playerTwo']
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

module.exports = { player, links, game, message, id }
