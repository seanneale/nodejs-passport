
// Load passport local
var localStrategy = require('passport-local').Strategy;

// Load Facebook
var FacebookStrategy = require('passport-facebook').Strategy;

// Load validator
var validator = require('validator');

// Load user model
var User = require('../model/user');

// Load settings
var config = require('../config.json');

module.exports = function( passport ) {

  // Serialize user
  passport.serializeUser( function( user, done){
      done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(function(id, done){
      User.findById(id, function(err, user){
        done(err, user);
      });
  });

  // Passport signup
  passport.use('local-signup', new localStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback: true
    },
    function( req, email, password, done){

        // Check that the email is in the right format
        if( !validator.isEmail(email) ){
          return done(null, false, req.flash('loginMessage','That is not a valid email address'));
        }

        // Check that the password is at least 8 chars
        if( password.length < 8 ){
          return done(null, false, req.flash('loginMessage','The password needs to be 8 chars long'));
        }

        process.nextTick(function(){
          User.findOne( {'local.email' : email }, function(err, user){
            if(err){
              return done(err);
            }
            if(user){
              return done(null, false, req.flash('loginMessage','That email is already in use'));
            }else{
              var newUser = new User();
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.save(function(err){
                if(err){
                  console.log(err);
                }
                return done(null, newUser, req.flash('loginMessage', 'Logged in successfully'));
              });
            }
          });
        });
    }));

  // Passport login
  passport.use('local-login', new localStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback: true
    },
    function( req, email, password, done){
        process.nextTick(function(){
          User.findOne( {'local.email' : email }, function(err, user){
            if(err){
              return done(err);
            }

            if(!user){
              return done(null,false, req.flash('loginMessage', 'sorry no one by that email'));
            }

            if(!user.validPassword(password)){
              return done(null,false, req.flash('loginMessage', 'sorry wrong password'));
             }

            return done(null, user, req.flash('loginMessage', 'Logged in successfully'));
          });
        });
    }));

    passport.use(new FacebookStrategy({
        clientID        : config.facebook.appId,
        clientSecret    : config.facebook.appSecret,
        callbackURL     : config.facebook.callback,
        profileFields   : ['id', 'emails', 'name']
    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their Facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return the error
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();
                    
                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    newUser.name = newUser.facebook.name;

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

}