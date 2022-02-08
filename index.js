require('dotenv').config()

const express = require('express')
const Cors = require('cors')
const bodyParser = require('body-parser')
const app = express();

app.use(Cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
const router = express.Router();

const {OpenTokLivestreamController} = require("./src/controller");
router.get('/opentok/stream', OpenTokLivestreamController.stream)
router.post('/opentok/join', OpenTokLivestreamController.join)
router.put('/opentok/publish', OpenTokLivestreamController.broadcast)
router.delete('/opentok', OpenTokLivestreamController.reset)
app.use(router)

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000

app.listen(PORT, HOST, () => {
  console.log(`Server running on PORT: ${PORT}`)
})
