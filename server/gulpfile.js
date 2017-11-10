/**
 * @Author: Jake
 * @Date:   2017-11-09T15:41:39+08:00
 * @Email:  yucj@dxy.cn
 * @Last modified by:   Jake
 * @Last modified time: 2017-11-09T15:43:24+08:00
 */
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('server', function() {
  nodemon({
    script: 'app.js', // 忽略部分对程序运行无影响的文件的改动，nodemon只监视js文件，可用ext项来扩展别的文件类型
    ignore: ["gulpfile.js", "node_modules/", "public/**/*.*"],
    env: {
      'NODE_ENV': 'development'
    }
  })
});

gulp.task('dev', ['server'])
