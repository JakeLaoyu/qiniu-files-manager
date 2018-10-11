var express = require('express')
var router = express.Router()
const Api = require('../controllers/api')

router.post('/postSecret', Api.postSecret)

router.get('/getBuckets', Api.getBuckets)

router.get('/uploadToken', Api.checkAccessKeySecretKey, Api.uploadToken)
router.get('/getImages', Api.checkAccessKeySecretKey, Api.getImages)

router.get('/detail', Api.detail)

router.post('/delImage', Api.delImage)
router.post('/moveImage', Api.moveImage)
router.post('/multipleMoveImage', Api.multipleMoveImage)

router.get('/delSession', Api.delSession)

module.exports = router
