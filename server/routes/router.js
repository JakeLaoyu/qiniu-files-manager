var express = require('express');
var router = express.Router();
const api = require('../controllers/api')

router.post('/postSecret', api.postSecret)

router.get('/uploadToken', api.checkAccessKeySecretKey, api.uploadToken);
router.get('/getImages', api.checkAccessKeySecretKey, api.getImages);

router.get('/detail', api.detail)

router.post('/delImage', api.delImage)
router.post('/moveImage', api.moveImage)


router.get('/delSession', api.delSession)

module.exports = router;
