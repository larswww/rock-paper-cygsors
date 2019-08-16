const dotenv = require('dotenv').config()
if (dotenv.error) {
  throw dotenv.error
}

console.log(dotenv.parsed)
const server = require('./server')
