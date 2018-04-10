import GoogleStrategy from 'passport-google-oauth20';
// Import Facebook and Google OAuth apps configs
import { google } from '../config';


var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Register 
var User = require('../models/user');

const transformGoogleProfile = (profile) => ({
    name: profile.displayName,
    avatar: profile.image.url,
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

passport.use(new GoogleStrategy(google,
    async function(accessToken, refreshToken, profile, done){done(null, transformGoogleProfile(profile._json))}
  ));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.getUserById(id, function(err, user){
        done(err, user)
    });
});

// Set up Google auth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  function(req, res){res.redirect('Financer://login?user=' + JSON.stringify(req.user))});


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