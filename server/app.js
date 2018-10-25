const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const lessMiddleware = require('less-middleware')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const io = require('@pm2/io')

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
app.use(io.expressErrorHandler())

app.listen(port)
console.log('listen port: ' + port)
