const {DateTime} = require("luxon");

module.exports.build = async (res, service, params) => {
    const { status, success, message, data } = await service(params)
    console.info(`response (${DateTime.now().toISO()}): ${JSON.stringify({ status, success, message })}`)
    return res.status(status).send({ success, message, data })
}

module.exports.OpenTokLivestreamController = require('./OpenTokStreamController')