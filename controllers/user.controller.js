const User = require('../models/User');
const Historique = require('../models/Historique_transaction');
const Vehicule = require('../models/Vehicule');

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const passport = require('passport');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');


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

/*
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
*/

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

exports.register = async (req, res, next) => {


  if(!req.files){
    imageFile = "";
  }

  if(req.files){
    var imageFile = typeof req.files.avatar !== "undefined" ? req.files.avatar.name : "";
  }

  req.checkBody('pic', 'you must').isImage(imageFile);

  User.findOne({ telephone: req.body.telephone }).then(user => {
    if (user) {
      console.log('Telephone or Username already exists' );
      res.render('auth/register', {
        postnom: req.body.postnom.toUpperCase(),
        prenom: req.body.prenom.toUpperCase(),
        nom: req.body.nom.toUpperCase(),
        avatar: imageFile,
        telephone: req.body.telephone,
        email: req.body.email,
        password: req.body.password,
      });
    } else {
      const newUser = new User({
        postnom: req.body.postnom.toUpperCase(),
        prenom: req.body.prenom.toUpperCase(),
        nom: req.body.nom.toUpperCase(),
        avatar: imageFile,
        telephone: req.body.telephone,
        email: req.body.email,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          
          newUser
            .save()
            .then(user => {
              
              mkdirp('public/user_avatar/' + user._id, function(err){
                return console.log(err);
              });

              mkdirp('public/user_avatar/' + user._id + '/user', function(err){
                return console.log(err);
              });

              if(imageFile != ""){
                var userImage = req.files.avatar;
                var path = 'public/user_avatar/' + user._id + '/' + imageFile;

                userImage.mv(path, function(err){
                    return console.log(err);
                });
              }

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

// get user image for the profile
exports.getUserImage = async (req, res, next) =>{
  // userData =  req.user;

  await User.findById({
    _id: req.user._id
  }).then((result) =>{
    res.status(200).render('_layouts/headprofile', {user: result});
  }).catch((error)=>{
    res.status(500).send(error);
  });

}

// Get image for side
exports.getUserImageside = async (req, res, next) =>{
  // userData =  req.user;

  await User.findById({
    _id: req.user._id
  }).then((result) =>{
    res.status(200).render('_layouts/headside', {user: result});
  }).catch((error)=>{
    res.status(500).send(error);
  });

}

exports.getUserImageside2 = async (req, res, next) =>{
  // userData =  req.user;

  await User.findById({
    _id: req.user._id
  }).then((result) =>{
    res.status(200).render('_layouts/headside2', {user: result});
  }).catch((error)=>{
    res.status(500).send(error);
  });

}

/*
* GET profile user
*/


// "6064ab585f194a098c13af36"

exports.getProfile = async (req, res, next) =>{

  userData =  req.user; //req.session.passport;

  console.log("userdata ", userData);

  const user = await User.findById({
    _id: userData._id
  }).then(async (result) =>{
    console.log("User profile ", result)

    await Historique.find({idUser: result._id}).sort('-createdAt').limit(5).exec(async function (err, user) {
      if (err) {
          res.status(500).send(err)
      } else {
        
        const vehicule = await Vehicule.find({idUser: userData._id});
        console.log("vehicule in profile ", vehicule);
      
        res.status(200).render('auth/profile', { result: user, car: vehicule});
      }
    })


  }).catch((error)=>{
    console.log(error);
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
  req.logout();
  res.redirect('/user/login');
  req.flash('success_msg', 'You are logged out');
}

/*
  const userExist = await User.findOne({ email: req.body.email });
  const { nom, postnom, prenom, email, telephone, password } = req.body;

  const salt = await bcrypt.genSaltSync(10);

  const hashpassword = await bcrypt.hash(password, salt);

  if (userExist) {
    res.status(400).json({ "error": 'User already Exist' });
  }else{
    const newUser = new User({
      postnom: postnom,
      prenom: prenom,
      nom: nom,
      avatar: imageFile,
      telephone: telephone,
      email: email,
      password: hashpassword,
    });


  }
  */


/*

// const { nom, postnom, prenom, email, telephone } = req.body;
  console.log(req.body);
  const salt = await bcrypt.genSaltSync(10);

  const hashpassword = await bcrypt.hash(req.body.password, salt);

  const emailExist = await User.findOne({email: req.body.email});

  if(emailExist){
    res.status(400).json({"error":'Email already Exist'})
  }

  let user =  new User({
    postnom: req.body.postnom,
    prenom: req.body.prenom,
    nom: req.body.nom,
    avatar: imageFile,
    telephone: req.body.telephone,
    email: req.body.email,
    password: hashpassword
  });

  try {

    const userSignup = await user.save(function(err){
       
      mkdirp('public/avatar_images/' + user._id, function(err){
        return console.log(err);
      });

      mkdirp('public/avatar_images/' + user._id + '/avatar', function(err){
        return console.log(err);
      });

      if(imageFile != ""){
        var userImage = req.files.avatar;
        var path = 'public/avatar_images/' + user._id + '/' + imageFile;

        userImage.mv(path, function(err){
          return console.log(err);
        });

      }

      req.flash(
        'success_msg',
        'You are now registered and can log in'
      );

    });
    res.redirect('/user/login');
  } catch (error) {
    next(error);
  }

*/


