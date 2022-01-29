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
  let livestream = await db['Livestream'].findOne({
    order: [['createdAt', 'DESC']],
    where: { ended: false }
  })

  if (!livestream) {
    const session = await createStreamSession()
    if (!session) return response.failed(messages.CREATION_ERROR('session'))

    livestream = await db['Livestream'].create({ sessionId: session.sessionId })
    if (!livestream) return response.failed(messages.CREATION_ERROR('livestream'))
  }

  return response.success({ sessionId: livestream.sessionId })
})

const stream = () => service(async () => {
  const initRes = await init()
  if (!initRes.success) return initRes
  const { sessionId } = initRes.data

  const tokenRes = await generateStreamToken({ sessionId, role: 'admin', appName })
  if (!tokenRes.success) return tokenRes
  const token = tokenRes.data

  return response.success({ sessionId, apiKey, token })
})

const join = () => {
  return response.success()
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

const generateStreamToken = (data) => service(async () => {
  const { sessionId, role, fullName } = data

  const token = openTok.generateToken(sessionId, {
    role: role.key === 'admin' ? 'publisher' : 'subscriber',
    data: JSON.stringify({ name: fullName }),
    expireTime: DateTime.now().plus({ hours: 2 }).valueOf(),
    initialLayoutClassList: ["focus"],
  })

  if (!token) return response.failed(messages.CREATION_ERROR('token'))
  return response.success(token)
})

module.exports = {
  stream,
  join,
}
