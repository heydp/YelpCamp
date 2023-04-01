const express = require('express');
const app = express();

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

app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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