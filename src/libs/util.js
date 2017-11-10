import axios from 'axios';
import env from '../config/env';

let util = {

};
util.title = function(title) {
  title = title ? title + ' - Home' : '七牛图床管理';
  window.document.title = title;
};

const ajaxUrl = env === 'development' ?
  'http://127.0.0.1:2017' :
  env === 'production' ?
  'https://www.url.com' :
  'https://debug.url.com';

util.axios = axios.create({
  baseURL: ajaxUrl,
  timeout: 30000,
  responseType: 'json'
});

export default util;
