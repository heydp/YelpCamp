const express = require('express');
const app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local');

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

const mongoose = require('mongoose');
async function dbConnMain(){
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp', {
            useNewUrlParser: true, 
            // useCreateIndex: true,
            useUnifiedTopology: true,
            // useFindAndModify: false
        });
        console.log("Connected successfully to the Mongodb")
      } 
      catch (error) {
        console.log("The Mongo connection err is : ", error)
        return;
      }
}
dbConnMain();


const session = require('express-session');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}));

const sessionConfig = {
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session( sessionConfig));
app.use(flash());

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const User = require('./models/user');

app.use(passport.initialize()); // session middleware must be initialized before this
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());        // How do we store the user in the sessiom
passport.deserializeUser(User.deserializeUser());    // How do we clear the user from the sessiom

app.use((req, res, next)=>{
    // console.log("The session is : ", req.session);
    res.locals.returnTo = req.session.returnTo;
    res.locals.currentUser = req.user; // directly available to ejs, no need to pass
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

app.get('/fakeUser', async(req, res) => {
    const user = new User({email: "dp16@gmail.com", username:'dp16'});
    const newUser = await User.register(user, 'password');
    console.log(user);
    console.log(newUser);
    res.send(newUser);
})

app.get('/', (req, res)=>{
    res.send("Welcome to the home dir");
})

app.get('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})
app.use((err, req, res, next) => {
    const{statusCode = 500, message = 'Something Went Wrong'} = err;
    if(!err.message) err.message = "Something Went Wrong";
    res.status(statusCode).render('error', {err : err});
})

app.listen(3000, ()=>{
    console.log("Up and running at port 3000")
})