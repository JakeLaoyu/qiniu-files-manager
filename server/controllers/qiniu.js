/**
 * @Author: Jake
 * @Date:   2017-11-13T09:36:08+08:00
 * @Email:  yucj@dxy.cn
 * @Last modified by:   Jake
 * @Last modified time: 2017-11-14T09:48:21+08:00
 */
const qiniu = require("qiniu");


exports.uploadToken = (accessKey, secretKey) => {
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  var options = {
    scope: test,
    callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
    callbackBodyType: 'application/json'
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  var uploadToken = putPolicy.uploadToken(mac);
  return uploadToken
}


/**
 * 图片列表
 * @param  {String} bucket 仓库名称
 * @param  {String} prefix 前缀
 * @return {[type]}        [description]
 */
exports.getImages = (accessKey, secretKey, bucket, prefix, cb) => {
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  var config = new qiniu.conf.Config();
  var bucketManager = new qiniu.rs.BucketManager(mac, config);

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
      console.log(respBody)
      var nextMarker = respBody.marker;
      var commonPrefixes = respBody.commonPrefixes;
      var items = respBody.items;
      console.log('nextMarker: ' + nextMarker)
      console.log('commonPrefixes: ' + commonPrefixes)
      var prefixTraverseResult = prefixTraverse(items, prefix)

      cb(prefixTraverseResult.images, prefixTraverseResult.prefixs)
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  });
}


/**
 * 遍历前缀
 * @param  {Array} images 七牛返回的图片数组
 * @return {[type]}        前缀数组
 */
function prefixTraverse(images, prefix) {
  var prefixs = []
  var imagesUrl = []

  images.forEach(item => {
    if (prefix) {
      item.key = item.key.replace(prefix, '')
    }

    var specialPrefix = false
    if (item.key[0] == '/') {
      console.log('prefix第一个字符为/')
      specialPrefix = true
      item.key = item.key.substr(1)
    }
    var itemArr = item.key.split('/')
    console.log(itemArr)
    if (itemArr.length > 1) {
      if (!specialPrefix && prefixs.indexOf(itemArr[0]) < 0) {
        prefixs.push(itemArr[0])
      } else if (specialPrefix && prefixs.indexOf('/' + itemArr[0]) < 0) {
        prefixs.push('/' + itemArr[0])
      }
    } else {
      imagesUrl.push(item)
    }
  })

  var data = {
    prefixs: prefixs,
    images: imagesUrl
  }

  return data
}
