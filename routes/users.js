var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
// Register 
var User = require('../models/user');



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
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.getUserById(id, function(err, user){
        done(err, user)
    });
});

// Login
router.post('/login',
  passport.authenticate('local', { successFlash: 'Welcome!', failureFlash: 'Invalid username or password.'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send('You were logged IN');
  });

router.get('/logout', function(req, res){
    req.logout()
    res.send('You were logged OUT')
});

module.exports = router;