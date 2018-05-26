/**
 * @Author: Jake
 * @Date:   2017-11-09T15:44:59+08:00
 * @Email:  yucj@dxy.cn
 * @Last modified by:   Jake
 * @Last modified time: 2017-11-16T10:27:19+08:00
 */

const qiniujs = require('./qiniu')
const qiniu = require('qiniu')

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
  var prefix = req.query.prefix || ''

  qiniujs.getImages(req, bucket, prefix, function (statusCode, respBody, images, prefixs) {
    res.json({
      code: statusCode === 200 ? 1 : statusCode,
      message: statusCode === 200 ? '' : respBody.error,
      images: images || [],
      prefixs: prefixs || []
    })
  })
}

// 获取token
exports.uploadToken = (req, res) => {
  var Bucket = req.query.bucket

  var token = qiniujs.uploadToken(req, Bucket)

  res.json({
    code: 1,
    uploadToken: token
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

// 获取文件详情
exports.detail = (req, res) => {
  var key = req.query.key
  var bucket = req.query.bucket

  qiniujs.getBucketManager(req).stat(bucket, key, function (err, respBody, respInfo) {
    if (err) {
      console.log(err)
    } else {
      if (respInfo.statusCode === 200) {
        res.json({
          code: 1,
          info: respBody
        })
      } else {
        console.log(respInfo.statusCode)
        console.log(respBody.error)
      }
    }
  })
}

// 删除文件
exports.delImage = (req, res) => {
  var key = req.body.key
  var bucket = req.body.bucket
  var deleteOperations = []

  if (key instanceof Array) {
    key.forEach(item => {
      deleteOperations.push(qiniu.rs.deleteOp(bucket, item))
    })
    qiniujs.getBucketManager(req).batch(deleteOperations, function (err, respBody, respInfo) {
      if (err) {
        console.log(err)
        // throw err;
      } else {
        console.log(respInfo.statusCode)
        console.log(respBody)
        res.json({
          code: 1,
          info: respBody
        })
      }
    })
  } else {
    qiniujs.getBucketManager(req).delete(bucket, key, function (err, respBody, respInfo) {
      if (err) {
        console.log(err)
        // throw err;
      } else {
        console.log(respInfo.statusCode)
        console.log(respBody)

        res.json({
          code: 1,
          info: respBody
        })
      }
    })
  }
}

// 移动文件
exports.moveImage = (req, res) => {
  var key = req.body.key
  var newKey = req.body.newKey
  var bucket = req.body.bucket

  // 强制覆盖已有同名文件
  var options = {
    force: false
  }

  qiniujs.getBucketManager(req).move(bucket, key, bucket, newKey, options, function (
    err, respBody, respInfo) {
    if (err) {
      console.log(err)
      // throw err;
    } else {
      // 200 is success
      console.log(respBody)
      if (respInfo.statusCode === 614) {
        return res.json({
          code: 0,
          message: '文件名重复'
        })
      }
      res.json({
        code: 1
      })
    }
  })
}
