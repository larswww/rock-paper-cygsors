'use strict'
const dotenv = require('dotenv').config()
const server = require('./server')

if (dotenv.error) {
  console.error('Did you create a .env file in root dir?')
  throw dotenv.error
}
