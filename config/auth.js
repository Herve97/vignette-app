module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/user/login');
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/home');
  },
  allowIfLoggedin: async (req, res, next) => {
    try {
      const user = res.locals.loggedInUser;
      if (!user) {
        return console.log("User not loggedIn")
        // res.status(401).json("User not loggedIn");
      }
      // res.status(200).json("You are connected");
      req.user = user;
      next();
    }catch (error) {
      next(error);
    }
  }

};