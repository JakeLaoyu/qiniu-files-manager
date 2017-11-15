import axios from 'axios';
import env from '../config/env';

let util = {

};
util.title = function(title) {
  title = title ? title + ' - Home' : '七牛图床管理';
  window.document.title = title;
};

const ajaxUrl = env === 'development' ?
  'http://dev.jakeyu.top:8080' :
  'http://qiniu.jakeyu.top'

util.axios = axios.create({
  baseURL: ajaxUrl,
  timeout: 30000,
  responseType: 'json'
});

export default util;
