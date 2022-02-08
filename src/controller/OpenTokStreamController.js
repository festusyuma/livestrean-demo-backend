const {build} = require("./index");
const { LivestreamService } = require("../service");

const stream = (req, res) => build(res, LivestreamService.stream, {})
const join = (req, res) => build(res, LivestreamService.join, {
    data: req.body
})
const reset = (req, res) => build(res, LivestreamService.reset, {})

const OpenTokStreamController = {
    stream,
    join,
    reset
}

module.exports = OpenTokStreamController
