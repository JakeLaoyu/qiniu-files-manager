import { Controller, Get, Post, Req, Res, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import * as qiniu from 'qiniu';
import * as lodash from 'lodash';
import axios from 'axios';
import { AppService } from '../service/app.service';

const QiniuApi = {
  buckets: 'https://rs.qbox.me/buckets',
  domainList: 'https://api.qiniu.com/v6/domain/list?tbl=',
};

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('private-token')
  getPrivateToken(@Req() req: Request) {
    if (!req.query.domain) {
      return {
        code: 1,
        message: 'domain is required',
      };
    }

    const domain = req.query.domain as string;

    const token = this.appService.privateToken({
      accessKey: req.session.accessKey,
      secretKey: req.session.secretKey,
      key: req.query.key,
      domain: domain.substring(0, domain.length - 1),
    });

    return {
      code: 0,
      data: {
        token: token.split('?')[1],
      },
    };
  }

  // get buckets by ak & sk
  @Get('buckets')
  async getBuckets(@Req() req: Request) {
    let result: {
      data?: any[];
    } = {};

    try {
      result = await axios({
        url: QiniuApi.buckets,
        method: 'get',
        headers: {
          Authorization: qiniu.util.generateAccessToken(
            this.appService.getMac(req),
            QiniuApi.buckets,
            null,
          ),
        },
      });
    } catch (error) {
      return {
        code: error.response.status,
        message: '请填写合法AccessKey、SecretKey',
      };
    }

    if (result.data && result.data.length) {
      const getDomainFunList = [];

      result.data.forEach((item) => {
        getDomainFunList.push(
          axios({
            url: QiniuApi.domainList + item,
            method: 'get',
            headers: {
              Authorization: qiniu.util.generateAccessToken(
                this.appService.getMac(req),
                QiniuApi.domainList + item,
                null,
              ),
            },
          }).then((domain) => {
            return {
              AccessKey: req.session.accessKey,
              SecretKey: req.session.secretKey,
              bucket: item,
              domains: domain.data,
              isPrivate: 0,
              // 空间区域，默认华东
              region: 'z0',
            };
          }),
        );
      });

      const domainList = await Promise.all(getDomainFunList);

      return {
        code: 0,
        data: domainList,
      };
    } else {
      return {
        code: 1,
        message: '发生错误，请检查AccessKey、SecretKey是否填写正确',
      };
    }
  }

  // save ak sk
  @Post('secret')
  postSecret(@Req() req: Request) {
    console.log('req.body.accessKey', req.body.accessKey);
    console.log('req.body.secretKey', req.body.secretKey);
    req.session.accessKey = req.body.accessKey;
    req.session.secretKey = req.body.secretKey;

    return {
      code: 0,
    };
  }

  @Get('images')
  async getImages(@Req() req: Request) {
    const bucket = req.query.bucket;
    const domain = req.query.domain as string;
    const isPrivate = req.query.private;
    const search = req.query.search || '';
    const prefix = req.query.prefix || '';
    const costomPrefixSearch = (req.query.costomPrefixSearch as string) || '';
    const nextMarker = req.query.nextMarker as string;
    const pagesize = req.query.pagesize || 50;

    const result = await this.appService.getImages({
      req,
      bucket,
      prefix,
      costomPrefixSearch,
      search,
      nextMarker,
      pagesize,
    });
    if (isPrivate) {
      // 私有空间获取凭证
      result.images &&
        result.images.forEach((item) => {
          item.private = this.appService
            .privateToken({
              accessKey: req.session.accessKey,
              secretKey: req.session.secretKey,
              key: `${prefix}${item.key}`,
              domain: domain.substring(0, domain.length - 1),
            })
            .split('?')[1];
        });
    }

    result.prefixs = result.prefixs.map((item) => {
      let str = item;
      if (prefix && !costomPrefixSearch) str = item.replace(prefix, '');
      str = str.slice(0, str.length - 1);
      return str;
    });

    return {
      code: result.statusCode === 200 ? 0 : result.statusCode,
      data: {
        images: result.images || [],
        prefixs: result.prefixs || [],
        nextMarker: result.nextMarker,
      },
      message:
        result.statusCode === 200
          ? ''
          : lodash.get(result, 'resultpBody.error', '发生错误'),
    };
  }

  // 获取token
  @Get('upload-token')
  uploadToken(@Req() req: Request) {
    const Bucket = req.query.bucket;

    const token = this.appService.uploadToken(req, Bucket);

    return {
      code: 0,
      data: {
        uploadToken: token,
      },
    };
  }

  @Delete('session')
  delSession(@Req() req: Request) {
    req.session.accessKey = '';
    req.session.secretKey = '';

    return {
      code: 0,
    };
  }

  @Get('detail')
  detail(@Req() req: Request, @Res() res: Response) {
    const key = req.query.key as string;
    const bucket = req.query.bucket as string;

    this.appService
      .getBucketManager(req)
      .stat(bucket, key, function (err, respBody, respInfo) {
        if (err) {
          console.log(err);
        } else {
          if (respInfo.statusCode === 200) {
            res.json({
              code: 0,
              data: respBody,
            });
          } else {
            console.log(respInfo.statusCode);
            console.log(respBody.error);
            res.json({
              code: 1,
              message: respBody.error,
            });
          }
        }
      });
  }

  @Delete('image')
  delImage(@Req() req: Request, @Res() res: Response) {
    const key = req.body.key;
    const bucket = req.body.bucket;
    const deleteOperations = [];

    if (key instanceof Array) {
      if (key.length > 1000) {
        return {
          code: 0,
          message: '单次最多1000个文件',
        };
      }
      key.forEach((item) => {
        deleteOperations.push(qiniu.rs.deleteOp(bucket, item));
      });
      this.appService
        .getBucketManager(req)
        .batch(deleteOperations, function (err, respBody, respInfo) {
          if (err) {
            console.log(err);
            // throw err;
          } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
            res.json({
              code: 0,
              info: respBody,
            });
          }
        });
    } else {
      this.appService
        .getBucketManager(req)
        .delete(bucket, key, function (err, respBody, respInfo) {
          if (err) {
            console.log(err);
            // throw err;
          } else {
            console.log(respInfo.statusCode);
            console.log(respBody);

            res.json({
              code: 0,
              info: respBody,
            });
          }
        });
    }
  }

  @Post('move-image')
  moveImage(@Req() req: Request, @Res() res: Response) {
    const key = req.body.key;
    const newKey = req.body.newKey;
    const bucket = req.body.bucket;

    // 强制覆盖已有同名文件
    const options = {
      force: false,
    };

    this.appService
      .getBucketManager(req)
      .move(
        bucket,
        key,
        bucket,
        newKey,
        options,
        function (err, respBody, respInfo) {
          if (err) {
            console.log(err);
            // throw err;
          } else {
            // 200 is success
            console.log(respBody);
            if (respInfo.statusCode === 614) {
              return res.json({
                code: 1,
                message: '文件名重复',
              });
            }
            res.json({
              code: 0,
            });
          }
        },
      );
  }

  @Post('multiple-move-image')
  multipleMoveImage(@Req() req: Request, @Res() res: Response) {
    const keys = req.body.keys;
    const bucket = req.body.bucket;
    let newKey = req.body.newKey;

    newKey = newKey.substr(1);

    const moveOperations = [];

    if (keys.length <= 1000) {
      keys.forEach((item) => {
        moveOperations.push(
          qiniu.rs.moveOp(
            bucket,
            item,
            bucket,
            `${newKey}${item.split('/').pop()}`,
          ),
        );
      });
    } else {
      return res.json({
        code: 1,
        message: '单次最多1000个文件',
      });
    }

    this.appService
      .getBucketManager(req)
      .batch(moveOperations, function (err, respBody, respInfo) {
        if (err) {
          console.log(err);
          // throw err;
        } else {
          const errList = [];
          // 200 is success, 298 is part success
          if (parseInt(`${respInfo.statusCode / 100}`) === 2) {
            respBody.forEach(function (item) {
              if (item.code === 200) {
                // console.log(item.code + '\tsuccess')
              } else {
                errList.push(item.code + '\t' + item.data.error);
              }
            });

            if (errList.length === 0) {
              res.json({
                code: 0,
              });
            } else {
              res.json({
                code: 1,
                message: errList,
              });
            }
          } else {
            res.json({
              code: 0,
              info: respBody,
            });
          }
        }
      });
  }

  @Get('status')
  getStatus(@Req() req: Request, @Res() res: Response) {
    res.json({
      code: 0,
      data: {
        version: process.env.npm_package_version,
      },
    });
  }
}
