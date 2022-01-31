const { repo } = require('./');

const db = require('../db/models')

const fetchActive = async () => repo(
  () => db['OpenTokLV'].findOne({
    order: [['createdAt', 'DESC']],
    ended: false,
  })
)

const OpenTokRepo = {
  fetchActive,
}

module.exports = OpenTokRepo
