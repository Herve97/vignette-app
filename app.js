const cookieParser = require('cookie-parser');
const logger = require('morgan');
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const fileUpload = require('express-fileUpload');
const underscore = require('underscore');
const express = require('express');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
var path = require('path');

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


// View engine
app.set('view engine', 'ejs');

// Initialize the ejs template engine
app.engine('html', require('ejs').renderFile);

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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


/*
app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(accessToken, 'secretfortoken');
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
    }
    res.locals.loggedInUser = await User.findById(userId); next();
  } else {
    next();
  }
});
*/
