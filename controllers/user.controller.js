const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const passport = require('passport');
// const bcrypt = require('bcryptjs');


//Get All User
exports.getUsers = async (req, res, next) => {
  await User.find((err, user) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(user)
    }
  });
}

exports.getUser = async (req, res, next) => {
  await User.findById({
    _id: req.user._id
  }).then((result) =>{
    res.send(result._id);
  }).catch((error)=>{
    res.send(error);
  });
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/* 
 * Login Get and Post 
 
*/
exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
  
}

/*
 * POST add Player 
*/

exports.register = (req, res) => {
  const { nom, postnom, prenom, email, telephone, password } = req.body;

  User.findOne({ email: email }).then(user => {
    if (user) {
      console.log('Email or Username already exists' );
      res.render('auth/register', {
        postnom,
        prenom,
        nom,
        telephone,
        email,
        password,
      });
    } else {
      const newUser = new User({
        postnom,
        prenom,
        nom,
        telephone,
        email,
        password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              req.flash(
                'success_msg',
                'You are now registered and can log in'
              );
              res.redirect('/user/login');
            })
            .catch(err => console.log(err));
        });
      });
    }
  });

}


/*
 * GET delete User 
 */

exports.deleteUser = async (req, res, next) => {
  await User.findByIdAndRemove(req.params.userId, function (err) {
    if (err)
      return constructor(err);
    req.flash('success', 'User delete');
  });
}

/* 
 * Logout
 */
exports.logout = (req, res, next) => {
  res.redirect('/user/login');
  req.logout();
  req.flash('success_msg', 'You are logged out');
}

/*
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error('Email does not exist'));
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) return next(new Error('Password is not correct'))
    var accessToken = jwt.sign({ userId: user._id }, "secretfortoken", {
      expiresIn: "1d"
    });
     const logger = await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({logger, accessToken});
    
  } catch (error) {
    next(error);
  }
}
*/

/*
exports.signup = async (req, res, next) => {
  const emailExist = await User.findOne({ email: req.body.email })

  if (emailExist) {
    res.status(400).json({ "error": 'Email already Exist' })
  }
  try {
    const { nom, postnom, prenom, email, telephone, password } = req.body
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ nom, postnom, prenom, email, telephone, password: hashedPassword });
    const accessToken = jwt.sign({ userId: newUser._id }, "secretfortoken", {
      expiresIn: "1d"
    });
    newUser.accessToken = accessToken;
    await newUser.save();
    res.status(200).json({
      data: newUser,
      accessToken
    })
  } catch (error) {
    next(error)
  }
}
*/

/*

exports.login = async (req, res, next) => {
  const emailExist = await User.findOne({ email: req.body.email });
  if (!emailExist) {
    res.status(400).json({ error: "Email not Found" })
  }

  const checkpassword = await bcrypt.compare(req.body.password, emailExist.password);
  if (!checkpassword) {
    res.status(400).json({ error: "Password mismatch" })
  }

  const token = jwt.sign({ id: emailExist.id }, 'anystring')
  res.header('auth-token', token).json({
    message: emailExist.nom,
    'Token': token
   })
}




exports.register = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);

  const hashpassword = await bcrypt.hash(req.body.password, salt)

  const emailExist = await User.findOne({ email: req.body.email });

  if (emailExist) {
    res.status(400).json({ "error": 'Email already Exist' })
  }

  let user = new User({
    nom: req.body.nom,
    postnom: req.body.postnom,
    prenom: req.body.prenom,
    email: req.body.email,
    telephone: req.body.telephone,
    password: hashpassword
  });


  await user.save().then((result) =>{
    res.status(200).send({
      message: "User successfully created",
      result: result
    });
  }).catch((err) =>{
    return res.status(500).send({ msg: err.message });
  });

}

*/