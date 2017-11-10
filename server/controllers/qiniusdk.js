/**
 * @Author: Jake
 * @Date:   2017-11-09T15:44:59+08:00
 * @Email:  yucj@dxy.cn
 * @Last modified by:   Jake
 * @Last modified time: 2017-11-10T18:46:50+08:00
 */

const qiniu = require("qiniu");

exports.postSecret = (req, res) => {
  global.accessKey = req.body.accessKey
  global.secretKey = req.body.secretKey

  console.log('global.accessKey: ' + global.accessKey)
  console.log('global.secretKey : ' + global.secretKey)

  res.json({
    code: 1
  })
}

exports.uploadToken = (req, res) => {
  // var accessKey = req.body.accessKey
  // var secretKey = req.body.secretKey
  var Bucket = req.query.Bucket
  var Domain = req.query.Domain
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  var options = {
    scope: test,
    callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
    callbackBodyType: 'application/json'
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  var uploadToken = putPolicy.uploadToken(mac);

  res.json({
    code: 1,
    uploadToken: uploadToken
  })
}


exports.getImages = (req, res) => {
  // var accessKey = req.body.accessKey
  // var secretKey = req.body.secretKey
  var bucket = req.query.bucket
  var domain = req.query.domain
  var prefix = req.query.prefix

  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  var config = new qiniu.conf.Config();
  var bucketManager = new qiniu.rs.BucketManager(mac, config);
  var publicBucketDomain = domain

  // @param options 列举操作的可选参数
  //                prefix    列举的文件前缀
  //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
  //                limit     每次返回的最大列举文件数量
  //                delimiter 指定目录分隔符
  var options = {
    // limit: 10,
    prefix: prefix
  };
  bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
    if (err) {
      console.log(err);
      throw err;
    }
    if (respInfo.statusCode == 200) {
      //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
      //指定options里面的marker为这个值
      var nextMarker = respBody.marker;
      var commonPrefixes = respBody.commonPrefixes;
      console.log(nextMarker);
      console.log(commonPrefixes);
      var items = respBody.items;
      res.json({
        code: 1,
        images: items
      })
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  });
}
