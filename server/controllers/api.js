/**
 * @Author: Jake
 * @Date:   2017-11-09T15:44:59+08:00
 * @Email:  yucj@dxy.cn
 * @Last modified by:   Jake
 * @Last modified time: 2017-11-14T10:24:11+08:00
 */

const qiniujs = require('./qiniu')

// 保存 ak sk
exports.postSecret = (req, res) => {
  req.session.accessKey = req.body.accessKey
  req.session.secretKey = req.body.secretKey

  res.json({
    code: 1
  })
}


// 获取图片
exports.getImages = (req, res) => {
  var bucket = req.query.bucket
  var domain = req.query.domain
  var prefix = req.query.prefix || ''


  qiniujs.getImages(req.session.accessKey, req.session.secretKey, bucket, prefix, function(images, prefixs) {
    res.json({
      code: 1,
      images: images,
      prefixs: prefixs
    })
  })

}


// 获取token
exports.uploadToken = (req, res) => {
  var Bucket = req.query.Bucket
  var Domain = req.query.Domain

  res.json({
    code: 1,
    uploadToken: qiniujs.uploadToken()
  })
}


/**
 * 检查session中是否有ak sk
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.checkAccessKeySecretKey = (req, res, next) => {
  if (!req.session.accessKey || !req.session.secretKey) {
    return res.json({
      code: 3,
      message: 'accessKey secretKey 不存在'
    })
  }

  next()
}


exports.delSession = (req, res) => {
  req.session.accessKey = ''
  req.session.secretKey = ''
  res.send({
    code: 1
  })
}
