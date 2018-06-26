var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var lessMiddleware = require('less-middleware')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var Raven = require('raven')
Raven.config('https://185f6024c5ba4b64a2a1cd6adaabd41c@sentry.io/1232836').install()

var router = require('./routes/router')

var port = process.env.PORT || '2017'
var dbUrl = 'mongodb://localhost/qiniumanager'

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('short'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(lessMiddleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))

// 使用session
app.use(cookieParser())
app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  },
  resave: true,
  saveUninitialized: true,
  secret: '0A6194FD0E695254A939A25C3D868D2C',
  // session持久化，存在到mongodb中
  store: new MongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}))

app.use('/api', router)

app.listen(port)
console.log('listen port: ' + port)
