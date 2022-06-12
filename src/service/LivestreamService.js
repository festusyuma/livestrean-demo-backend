const OpenTok = require("opentok")
const db = require('../db/models')
const { response, messages } = require("../util");
const { service } = require("./");
const { OpenTokRepo } = require('../repo');
const {DateTime} = require("luxon");
const AWS = require("aws-sdk");
const jwt = require('jsonwebtoken')
const fs = require('fs')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
})

const appName = process.env.APP_NAME || 'Festusyuma Livestream test'
const apiKey = process.env.OPENTK_API_KEY
const secret = process.env.OPENTK_SECRET
const openTok = new OpenTok(apiKey, secret, null)
const ivs = new AWS.IVS()

const init = () => service(async () => {
  let livestream = await OpenTokRepo.fetchActive()

  if (!livestream) {
    const session = await createStreamSession()
    const channel = await ivs.createChannel({
      authorized: true,
      name: `test_stream_${(Date.now())}`
    }).promise()

    console.log(channel)
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

const broadcast = async () => service(async () => {
  const initRes = await init()
  if (!initRes.success) return initRes
  const sessionId = initRes.data

  openTok.startBroadcast(sessionId, {
    outputs: {
      /*hls: {
        lowLatency: true,
      },*/
      resolution: '1280x720',
      rtmp: [
        {
          id: "test",
          serverUrl: 'rtmps://1019632c767c.global-contribute.live-video.net:443/app/',
          streamName: 'sk_eu-central-1_XGr8b3nvTrqM_d1rDMSO8S6xw9HbRgE0cabbWvrlZr6'
        }
      ]
    }
    /*settings: {
      hls: {
        lowLatency: true,
      }
    },*/
  }, (error, session) => {
    console.log(error)
    console.log(session)
    console.log(session.broadcastUrls.rtmp)
  })

  return response.success()
})

const join = ({ data }) => service(async () => {
  const { fullName, phoneNumber } = data

  const privateKey = fs.readFileSync('./private-key.pem')
  const awsToken = jwt.sign(
    {
      "aws:channel-arn": "arn:aws:ivs:eu-central-1:495166456101:channel/R6keFzqm0oKM",
      "aws:access-control-allow-origin": "*",
      "exp": DateTime.now().plus({ hours: 2 }).valueOf()
    },
    privateKey,
    { algorithm: "ES384" }
  )
  console.log(awsToken)
  return response.failed('no error occurred')

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

  return response.success({ sessionId, apiKey, token, key })
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
  broadcast,
}
