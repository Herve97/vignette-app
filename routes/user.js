var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../config/auth');

//Get User Route
router.get("/userlist", auth.allowIfLoggedin, userController.getUsers);

//Get User Route
router.get("/", auth.allowIfLoggedin, userController.getUser);

//Post add User
router.post('/register', userController.register);

//Delete User
router.delete('/userdel/:userId',userController.deleteUser);

//Login
router.post('/login', userController.login);

//Login
router.get('/logout', userController.logout);

router.get('/login', function(req, res){
  res.render('auth/login', { title: 'Login'});
});

router.get('/register', function(req, res){
  res.render('auth/register', { title: 'Register'});
});

router.get('/profile', userController.getProfile);

router.get('/userimage', userController.getUserImage);

router.get('/userimageside', userController.getUserImageside);
router.get('/userimageside2', userController.getUserImageside2);

module.exports = router;