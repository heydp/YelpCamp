const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');

const {isLoggedIn} = require('../middleware');

const{isAuthor, validateCampground} = require('../middleware');

const campgrounds = require('../controllers/campgrounds');

const multer  = require('multer')

const {storage} = require('../cloudinary/index');
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn , upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    // .post(upload.array('image'), (req, res)=>{   
    //     console.log(req.body, req.files);                                      //field has to be same as the naem of input in the form
    //     res.send("It worked");
    // })

router.get('/new', isLoggedIn , campgrounds.renderNewForm);

router.route('/:id')
.get(isLoggedIn, catchAsync(campgrounds.showCampground))    // If you chain routes, don't put semicolon
.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground ,catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;