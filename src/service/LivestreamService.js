const OpenTok = require("opentok")
const db = require('../db/models')
const { response, messages } = require("../util");
const { service } = require("./");
const { OpenTokRepo } = require('../repo');
const {DateTime} = require("luxon");

const appName = process.env.APP_NAME || 'Festusyuma Livestream test'
const apiKey = process.env.OPENTK_API_KEY
const secret = process.env.OPENTK_SECRET
const openTok = new OpenTok(apiKey, secret, null)

const init = () => service(async () => {
  let livestream = await OpenTokRepo.fetchActive()

  if (!livestream) {
    const session = await createStreamSession()
    if (!session) return response.failed(messages.CREATION_ERROR('session'))

    livestream = await db['OpenTokLV'].create({ sessionId: session.sessionId })
    if (!livestream) return response.failed(messages.CREATION_ERROR('livestream'))
  }
  return response.success(livestream.sessionId)
})

const stream = () => service(async () => {
  const initRes = await init()
  if (!initRes.success) return initRes
  const sessionId = initRes.data

  const tokenData = { fullName: appName, username: 'admin', sessionId, role: 'admin' }
  const tokenRes = await fetchToken(tokenData)
  if (!tokenRes) return tokenRes
  const token = tokenRes.data

  return response.success({ sessionId, apiKey, token })
})

const reset = async () => service(async () => {
  let livestream = await OpenTokRepo.fetchActive()
  if (livestream) await livestream.destroy()

  return response.success()
})

const join = ({ data }) => service(async () => {
  const { fullName, phoneNumber } = data
  if (!phoneNumber) return response.badRequest(messages.FIELD_REQUIRED('phone number'))

  let livestream = await OpenTokRepo.fetchActive()
  if (!livestream) return response.failed(messages)

  const sessionId = livestream.sessionId
  const tokenData = {
    fullName,
    username: phoneNumber,
    sessionId,
    role: 'user'
  }

  const tokenRes = await fetchToken(tokenData)
  if (!tokenRes) return tokenRes
  const token = tokenRes.data

  return response.success({ sessionId, apiKey, token })
})

const createStreamSession = async () => {
  return new Promise((resolve, reject) => {
    openTok.createSession({
      mediaMode: 'routed'
    }, (e, session) => {
      if (e) reject(e)
      else if (session) resolve(session)
      else reject('error creating ')
    })
  })
}

const fetchToken = async (data) => service(async () => {
  const { sessionId, role, username, fullName } = data

  let token = await db['OpenTokLVToken'].findOne({
    where: { sessionId, username }
  })

  if (!token) {
    const tokenRes = await generateStreamToken({ sessionId, role, fullName })
    if (!tokenRes.success) return tokenRes

    token = await db['OpenTokLVToken'].create({ token: tokenRes.data, sessionId, username })
    if (!token) return response.failed(messages.GENERATION_ERROR('token'))
  }

  return response.success(token.token)
})

const generateStreamToken = (data) => service(async () => {
  const { sessionId, role, fullName } = data

  const token = openTok.generateToken(sessionId, {
    role: role === 'admin' ? 'publisher' : 'subscriber',
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
  reset,
}
