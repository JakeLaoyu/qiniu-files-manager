var express = require('express');
var router = express.Router();
const qiniusdk = require('../controllers/qiniusdk')

router.post('/postSecret', qiniusdk.postSecret)

router.get('/uploadToken', qiniusdk.uploadToken);
router.get('/getImages', qiniusdk.getImages);

module.exports = router;
