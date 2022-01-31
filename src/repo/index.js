module.exports.repo = async (func) => {
  try {
    return func()
  } catch (e) {
    console.error('Repo error')
    console.error(e)
  }

  return null
}

module.exports.OpenTokRepo = require('./OpenTokRepo')
