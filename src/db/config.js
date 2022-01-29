const fs = require('fs')

require('dotenv').config()

const dbParams = {
  dialect: 'sqlite',
  storage: 'data.sqlite3'
}

const config = {
  development: dbParams,
  test: dbParams,
  production: dbParams,
}

module.exports = config
