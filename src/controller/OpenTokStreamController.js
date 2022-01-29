const {build} = require("./index");
const { LivestreamService } = require("../service");

const stream = (req, res) => build(res, LivestreamService.stream, {})
const join = (req, res) => build(res, LivestreamService.join, {
    data: req.body
})

const OpenTokStreamController = {
    stream,
    join
}

module.exports = OpenTokStreamController