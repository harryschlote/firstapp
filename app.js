if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.secret)

//setup
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const joi = require('joi');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const usersRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

//connecting to the database:
    //Development DB
    const dbUrl ='mongodb://localhost:27017/yelp-camp';
    //Deployment DB
    //const dbUrl = process.env.DB_URL
    mongoose.connect(dbUrl);


//check if its connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});


const app = express();

//use the ejs-mate engine instead of default one
app.engine('ejs',ejsMate);
//setting the view engine for the express app to EJS
app.set('view engine', 'ejs');
//specifies the directory where Express should look for view (template) files
app.set('views', path.join(__dirname, 'views'));
//ensures the body from the new camp form is parsed
app.use(express.urlencoded({extended: true}));
//overrise the method used in forms to overrise POST to PUT
app.use(methodOverride('_method'));
//use the public folder
app.use(express.static(path.join(__dirname,'public')));
//stop mongo injections
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24*60*60,
    crypto: {
        secret: SECRET
    }
})

store.on('error', function(e) {
    console.log('SESSION STORE ERROR', e)
})

//setup session config, using mongo to store our info
const sessionConfig = {
    store,
    name: 'session',
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
//enables all 11 of helmets middleware
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/", // Add this to allow Bootstrap's CSS

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/donug4rvf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);











app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Setting up flashes!!!!!!! AND using currentUser to see if user is loggedin - accessible in all tempaltes

app.use((req,res,next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//setting up user routes!!!!!!!!!

app.get('/fakeUser', async (req,res) => {
    const user = new User( {email: 'hschlote@gmail.com', username: 'harryyyy'});
    const newUser = await User.register(user, 'letchworth');
    res.send(newUser)
})




app.use('/', usersRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);


//making sure the home.ejs template is rendered on the '/' page
app.get('/', (req,res) => {
    res.render('home');
});





//ERROR HANDLING SECTION!

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.render('error', { err });
});


//connecting to server and listen for connections on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000');
});