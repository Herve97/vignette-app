const express = require('express');
const expressValidator = require('express-validator');
var path = require('path');
//const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const passport = require('passport');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connect to MongoDB
mongoose
  .connect(
    db,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


const publicDirectory = path.join(__dirname, 'public');
var liveReloadServer = livereload.createServer();
liveReloadServer.watch(publicDirectory);
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(connectLivereload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//pp.use(expressLayouts());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

//app.use(logger('dev'));


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);


//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.lenght){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
    isImage: function(value, filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch(extension){
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));


//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());
app.locals.errors = null;

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next(); 
});

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.get('/', (req, res) =>{
  res.redirect('/home');
});

// Routes
const indexRoutes = require('./routes/index');
const usersRouter = require('./routes/user');
const vehiculeRouter = require('./routes/vehicule');
const paiementRouter = require('./routes/transaction');

app.use('/', indexRoutes);
app.use('/user', usersRouter);
app.use('/vehicule', vehiculeRouter);
app.use('/paiement', paiementRouter);


app.listen(process.env.PORT || 3000, () => {
  console.log("I'm working well");
});

