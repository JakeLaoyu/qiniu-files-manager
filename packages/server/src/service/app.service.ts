import { Injectable } from '@nestjs/common';
import * as qiniu from 'qiniu';
import { Request } from 'express';

@Injectable()
export class AppService {
  getMac(req: Request) {
    return new qiniu.auth.digest.Mac(
      req.session.accessKey,
      req.session.secretKey,
    );
  }

  privateToken({ accessKey, secretKey, key, domain }) {
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const config = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const deadline = parseInt(`${Date.now() / 1000}`) + 3600; // 1小时过期
    const privateDownloadUrl = bucketManager.privateDownloadUrl(
      domain,
      key,
      deadline,
    );
    return privateDownloadUrl;
  }

  uploadToken(req, bucket) {
    const mac = new qiniu.auth.digest.Mac(
      req.session.accessKey,
      req.session.secretKey,
    );
    const options = {
      scope: bucket,
      callbackBody:
        '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
      callbackBodyType: 'application/json',
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
  }

  getImages({
    req,
    bucket,
    prefix,
    costomPrefixSearch = '',
    search,
    nextMarker = '',
    pagesize,
  }): Promise<any> {
    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    const options: Record<string, any> = {
      limit: pagesize,
      prefix: costomPrefixSearch || prefix,
    };

    if (!search) options.delimiter = '/';
    if (nextMarker) options.marker = nextMarker;
    return new Promise((resolve, reject) => {
      this.getBucketManager(req).listPrefix(
        bucket,
        options,
        (err, respBody, respInfo) => {
          if (err) {
            throw err;
          }

          const nextMarker = respBody.marker;
          const commonPrefixes = respBody.commonPrefixes || [];
          const items = respBody.items;
          let prefixTraverseResult = {} as any;
          if (!search) {
            prefixTraverseResult = this.prefixTraverse(items, prefix);
            const { images } = prefixTraverseResult;

            resolve({
              statusCode: respInfo.statusCode,
              respBody,
              images,
              prefixs: commonPrefixes,
              nextMarker,
            });
          } else {
            // 返回搜索结果
            const findResult = items
              ? items.filter((item) => {
                  return new RegExp(search).test(item.key);
                })
              : [];
            resolve({
              statusCode: respInfo.statusCode,
              respBody,
              images: findResult,
              prefixs: [],
              nextMarker,
            });
          }
        },
      );
    });
  }

  /**
   * 遍历前缀
   * @param  {Array} images 七牛返回的图片数组
   * @return {[type]}        前缀数组
   */
  prefixTraverse(images = [], prefix) {
    const prefixs = [];
    const imagesUrl = [];

    images.forEach((item) => {
      if (prefix) {
        item.key = item.key.replace(prefix, '');
      }

      const specialPrefix = false;
      const itemArr = item.key.split('/');
      if (itemArr.length > 1) {
        if (!specialPrefix && prefixs.indexOf(itemArr[0]) < 0) {
          prefixs.push(itemArr[0]);
        } else if (specialPrefix && prefixs.indexOf('/' + itemArr[0]) < 0) {
          prefixs.push('/' + itemArr[0]);
        }
      } else {
        imagesUrl.push(item);
      }
    });

    const data = {
      prefixs: prefixs,
      images: imagesUrl,
    };

    return data;
  }

  getBucketManager(req) {
    const mac = new qiniu.auth.digest.Mac(
      req.session.accessKey,
      req.session.secretKey,
    );
    const config = new qiniu.conf.Config({
      zone: qiniu.zone.Zone_z0,
    });
    // config.useHttpsDomain = true;
    // config.zone = qiniu.zone.Zone_z0;
    return new qiniu.rs.BucketManager(mac, config);
  }
}
