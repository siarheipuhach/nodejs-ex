import GoogleStrategy from 'passport-google-oauth20';
// Import Facebook and Google OAuth apps configs
import FacebookStrategy from 'passport-facebook';

import { google, facebook } from '../config';


var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Register 
var User = require('../models/user');

const transformGoogleProfile = (profile) => {
   return {
    id: profile.id,
    provider: 'google',
    email: profile.emails[0].value,
    name: profile.displayName,
    avatar: profile.image.url,
  }
};

const transformFacebookProfile = (profile) => ({
    email: profile.email,
    id: profile.id,
    provider: 'facebook',
    name: profile.name,
    avatar: profile.picture.data.url,
  });
  

router.post('/register', (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;   
    
    if (name && email && password){
        var newUser = new User({
            name: name,
            email: email,
            password: password
        });
        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });
        return res.send({'Success': 'You are registered'})
    }
    return res.send('Error')
  });

passport.use(new LocalStrategy(
    {usernameField: "email", passwordField: "password"},
    function(email, password, done) {
        User.getUserByEmail(email, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {'message' :'Unknown'})
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if (err) throw err;
                if (isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {'message': 'Invalid password'})
                }
            });
        });

    }
));

passport.use(new FacebookStrategy(facebook,
    function(token, tokenSecret, profile, done) {
        User.findOne({
            facebookId: profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                console.log('profile FACEBOOK')
                console.log(profile)
                newUser = new User({
                    facebookId: profile.id,
                    name: profile.displayName,
                    email: profile.email,
                    password: 'sdflksdmfkljsdnf',
                });
                User.createUser(newUser, function(err, user){
                    if(err) throw err;
                    return done(err, user);
                });
                
            } else {
                //found user. Return
                return done(err, user);
            }
        });

  }
  ));  


passport.use(new GoogleStrategy(google,
  function(token, tokenSecret, profile, done) {
        User.findOne({
            googleId: profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: 'sdflksdmfkljsdnf',
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });

  }
));

passport.serializeUser(function(user, done){
    console.log('INSIDE SERIALIZER')
    console.log(user)
    done(null, user.id)
});

passport.deserializeUser(function(id, done){   
    console.log('INSIDE DESERIALIZER') 
    console.log(id)
    User.getUserById(id, function(err, user){
        done(err, user)
    });
});

// Set up Facebook auth routes
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => 
  {console.log('req.user from router.get')
    console.log(req.user)
      return res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user))
    }
)

// Set up Google auth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/userinfo.email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));


// Login
router.post('/login',
  passport.authenticate('local', { successFlash: 'Welcome!', failureFlash: 'Invalid username or password.'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send(req.user);
  });

router.get('/logout', function(req, res){
    req.logout()
    res.send('You were logged OUT')
});

router.get('/isloggedin', function(req, res){
    console.log(req.user)
    console.log('req.isAuthenticated()')
    console.log(req.isAuthenticated())
    if(!req.user){
        res.statusCode = 403;
        res.send({'Error': 'You are not logged in user'})
    }
    else{
        res.statusCode = 200;
        res.send({'message': 'you are logged in user'})
    }
});

module.exports = router;