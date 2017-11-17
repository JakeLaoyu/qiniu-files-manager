import axios from 'axios';
import env from '../config/env';

let util = {

};
util.title = function(title) {
  title = title ? title + ' - Home' : '七牛文件管理';
  window.document.title = title;
};

const ajaxUrl = env === 'development' ?
  'http://dev.jakeyu.top:8080' :
  env === 'production' ?
  'http://qim.jakeyu.top' :
  'https://debug.url.com';

util.axios = axios.create({
  baseURL: ajaxUrl,
  timeout: 30000,
  responseType: 'json'
});

export default util;
