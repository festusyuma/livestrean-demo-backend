const OpenTok = require("opentok")
const db = require('../db/models')
const { response, messages } = require("../util");
const { service } = require("./");
const {DateTime} = require("luxon");

const appName = process.env.APP_NAME || 'Festusyuma Livestream test'
const apiKey = process.env.OPENTK_API_KEY
const secret = process.env.OPENTK_SECRET
const openTok = new OpenTok(apiKey, secret, null)

const init = () => service(async () => {
  let livestream = await db['OpenTokLV'].findOne({
    order: [['createdAt', 'DESC']],
    where: { ended: false }
  })

  if (!livestream) {
    const session = await createStreamSession()
    if (!session) return response.failed(messages.CREATION_ERROR('session'))

    livestream = await db['OpenTokLV'].create({ sessionId: session.sessionId })
    if (!livestream) return response.failed(messages.CREATION_ERROR('livestream'))
  }
  return response.success({ sessionId: livestream.sessionId })
})

const stream = () => service(async () => {
  const initRes = await init()
  if (!initRes.success) return initRes
  const { sessionId } = initRes.data

  let token = await db['OpenTokLVToken'].findOne({
    where: { sessionId, username: 'admin' }
  })

  if (!token) {
    const tokenRes = await generateStreamToken({ sessionId, role: 'admin', fulName: appName })
    if (!tokenRes.success) return tokenRes

    token = await db['OpenTokLVToken'].create({ token: tokenRes.data, sessionId, username: 'admin' })
    if (!token) return response.failed(messages.GENERATION_ERROR('token'))
  }

  return response.success({ sessionId, apiKey, token: token.token })
})

const join = (data) => service(async () => {
  const {  }
  return response.success()
})

const createStreamSession = async () => {
  return new Promise((resolve, reject) => {
    openTok.createSession({}, (e, session) => {
      if (e) reject(e)
      else if (session) resolve(session)
      else reject('error creating ')
    })
  })
}

const generateStreamToken = (data) => service(async () => {
  const { sessionId, role, fullName } = data

  const token = openTok.generateToken(sessionId, {
    role: role.key === 'admin' ? 'publisher' : 'subscriber',
    data: JSON.stringify({ name: fullName }),
    expirationTime: DateTime.now().plus({ days: 7 }).valueOf(),
    initialLayoutClassList: ["focus"],
  })

  if (!token) return response.failed(messages.CREATION_ERROR('token'))
  return response.success(token)
})

module.exports = {
  stream,
  join,
}
