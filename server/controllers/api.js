const qiniujs = require('./qiniu')
const qiniu = require('qiniu')
const axios = require('axios')
const Async = require('async')
const lodash = require('lodash')
const QiniuApi = {
  buckets: 'https://rs.qbox.me/buckets',
  domainList: 'https://api.qiniu.com/v6/domain/list?tbl='
}

// 获取私有空间文件 凭证
exports.getPrivateToken = (req, res) => {
  var token = qiniujs.privateToken({
    accessKey: req.session.accessKey,
    secretKey: req.session.secretKey,
    key: req.query.key,
    domain: req.query.domain.substring(0, req.query.domain.length - 1)
  })
  res.json({
    code: 1,
    token: token.split('?')[1]
  })
}

// 通过ak, sk获取 buckets列表
exports.getBuckets = async (req, res) => {
  let result = {}

  try {
    result = await axios({
      url: QiniuApi.buckets,
      method: 'get',
      headers: {
        Authorization: qiniu.util.generateAccessToken(qiniujs.getMac(req), QiniuApi.buckets, null)
      }
    })
  } catch (error) {
    console.error(error)
    return res.json({
      code: error.response.status,
      message: '请填写合法AccessKey、SecretKey'
    })
  }

  if (result.data && result.data.length) {
    var getDomainFunList = []

    result.data.forEach(item => {
      getDomainFunList.push(function (callback) {
        axios({
          url: QiniuApi.domainList + item,
          method: 'get',
          headers: {
            Authorization: qiniu.util.generateAccessToken(qiniujs.getMac(req), QiniuApi.domainList + item, null)
          }
        }).then(domain => {
          return callback(null, {
            AccessKey: req.session.accessKey,
            SecretKey: req.session.secretKey,
            bucket: item,
            domains: domain.data,
            isPrivate: 0,
            // 空间区域，默认华东
            region: 'z0'
          })
        })
      })
    })
    Async.parallel(getDomainFunList, (err, result) => {
      if (err) console.log(err)
      res.json({
        code: 1,
        data: result
      })
    })
  } else {
    res.json({
      code: 0,
      message: '发生错误，请检查AccessKey、SecretKey是否填写正确'
    })
  }
}

// 保存 ak sk
exports.postSecret = (req, res) => {
  req.session.accessKey = req.body.accessKey
  req.session.secretKey = req.body.secretKey

  res.json({
    code: 1
  })
}

// 获取图片
exports.getImages = async (req, res) => {
  var bucket = req.query.bucket
  var domain = req.query.domain
  var isPrivate = req.query.private
  var search = req.query.search || ''
  var prefix = req.query.prefix || ''
  var nextMarker = req.query.nextMarker
  var pagesize = req.query.pagesize || 50

  const result = await qiniujs.getImages({
    req,
    bucket,
    prefix,
    search,
    nextMarker,
    pagesize
  })
  if (isPrivate) {
    // 私有空间获取凭证
    result.images && result.images.forEach(item => {
      item.private = qiniujs.privateToken({
        accessKey: req.session.accessKey,
        secretKey: req.session.secretKey,
        key: `${prefix}${item.key}`,
        domain: domain.substring(0, domain.length - 1)
      }).split('?')[1]
    })
  }
  result.prefixs = result.prefixs.map(item => {
    let str = item
    if (prefix) str = item.replace(prefix, '')
    str = str.slice(0, str.length - 1)
    return str
  })

  res.json({
    code: result.statusCode === 200 ? 1 : result.statusCode,
    message: result.statusCode === 200 ? '' : lodash.get(result, 'resultpBody.error', '发生错误'),
    images: result.images || [],
    prefixs: result.prefixs || [],
    nextMarker: result.nextMarker
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
    if (key.length > 1000) {
      return res.json({
        code: 0,
        message: '单次最多1000个文件'
      })
    }
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

// 批量移动
exports.multipleMoveImage = (req, res) => {
  let keys = req.body.keys
  let bucket = req.body.bucket
  let newKey = req.body.newKey

  newKey = newKey.substr(1)

  let moveOperations = []

  if (keys.length <= 1000) {
    keys.forEach(item => {
      moveOperations.push(qiniu.rs.moveOp(bucket, item, bucket, `${newKey}${item.split('/').pop()}`))
    })
  } else {
    return res.json({
      code: 0,
      message: '单次最多1000个文件'
    })
  }

  qiniujs.getBucketManager(req).batch(moveOperations, function (err, respBody, respInfo) {
    if (err) {
      console.log(err)
    // throw err;
    } else {
      var errList = []
      // 200 is success, 298 is part success
      if (parseInt(respInfo.statusCode / 100) === 2) {
        respBody.forEach(function (item) {
          if (item.code === 200) {
            // console.log(item.code + '\tsuccess')
          } else {
            errList.push(item.code + '\t' + item.data.error)
          }
        })

        if (errList.length === 0) {
          res.json({
            code: 1
          })
        } else {
          res.json({
            code: 0,
            message: errList
          })
        }
      } else {
        console.log(respInfo.deleteusCode)
        console.log(respBody)

        res.json({
          code: 1,
          info: respBody
        })
      }
    }
  })
}
