var express = require('express'),
    morgan  = require('morgan'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    exphbs = require('express-handlebars'),
    expressValidator = require('express-validator'),
    flash = require('connect-flash'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongo = require('mongodb'),
    mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var items = require('./routes/items');


var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'views', 'partials')}
));
app.set('view engine', 'handlebars');

//BodyParser Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname,'public')));

// Express Session
app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: true
}))

//Pasport init
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    next();
});

app.use('/', routes);
app.use('/users', users)
app.use('/items', items)

// Set port
app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.listen(app.get('port'), function(){
    console.log('Server is running on port '+ app.get('port'));
});
// app.use(expressSession({secret: 'mySecretKey'}));
// app.use(passport.initialize());
// app.use(passport.session());


// mongoose.connect(mongoURL);

// module.exports = app;
