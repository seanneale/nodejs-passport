module.exports = function(app, passport){

  // Routes
  // router middelware
  function isLoggedIn(req, res, next) {

    if(req.isAuthenticated()) {
      return next();
    }

    res.redirect('/')
  }

  // Sign up
  app.get('/', function(req, res){
    res.render('signup', { message: req.flash('loginMessage') });
  });

  // Sign up
  app.post('/', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/',
    failureFlash: true
  }));

  // Login
  app.get('/login', function(req, res){
    res.render('login', { message: req.flash('loginMessage') });
  });

  // Login
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash: true
  }));

    // Profile
  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile', { message: req.flash('loginMessage'), user: req.user});
  });


  app.post('/change', isLoggedIn, function(req, res){

    // Change name
    if(req.body.name){
      req.user.name = req.body.name;
      req.user.save();
      req.flash('loginMessage','Name changed to ' + req.body.name );
      res.redirect('/profile');
    }

    // Change password
    if(req.body.current){
      if(req.user.validPassword( req.body.current )){
        req.user.local.password = req.user.generateHash(req.body.new);
        req.user.save();
        req.flash('loginMessage','Successfully change password');
        res.redirect('/profile');
      }
    }
  });

  // Facebook
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // Facebook callback
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
          }));

  // logout
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });
}