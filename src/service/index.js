const {response} = require("../util");

module.exports.handleError = (e) => {
  console.error('Service error')
  console.error(e)
}

module.exports.service = async (func) => {
  try {
    return await func()
  } catch (e) {
    return response.serverError(e)
  }
}

module.exports.LivestreamService = require('./LivestreamService')
