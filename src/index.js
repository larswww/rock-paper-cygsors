const dotenv = require('dotenv').config()
const server = require('./server')

if (dotenv.error) {
  console.error('Did you create a .env file in root dir? See README.md for info')
  throw dotenv.error
}
