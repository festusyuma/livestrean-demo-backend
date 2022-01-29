const { OpenTok } = require("opentok")

const apiKey = process.env.OPENTK_API_KEY
const secret = process.env.OPENTK_SECRET
const openTok = new OpenTok(apiKey, secret)

const init = () => {

}

const createStreamSession = async () => {
  return new Promise((resolve, reject) => {
    openTok.createSession({}, (e, session) => {
      if (e) reject(e)
      else if (session) resolve(session)
      else reject('error creating ')
    })
  })
}

module.exports = {

}
