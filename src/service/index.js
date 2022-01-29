module.exports.handleError = (e) => {
  console.error('Service error')
  console.error(e)
}

module.exports.LivestreamService = require('./LivestreamService')
