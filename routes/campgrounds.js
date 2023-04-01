const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

const {CampgroundSchema} = require('../schemas.js');

const validateCampground = (req, res, next) => {
  
    const {error} = CampgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
    // console.log("Validating : ", result);
}

router.get('/', catchAsync(async(req, res, next)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds:campgrounds});

}))
router.get('/new', async(req, res)=>{
   console.log("Getting new form for campground");
    res.render('campgrounds/new');

})
router.post('/',validateCampground ,catchAsync(async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError ("Invalid Campground data", 400);
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully created a new Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.get('/:id', catchAsync(async(req, res, next)=>{
    const {id} = req.params;
    console.log("Getting new campground" , id);
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', "Cannot find that Campground");
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/show', {campground:campground});

}))
router.get('/:id/edit', catchAsync(async(req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find that Campground");
        res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit', {campground:campground});

}))
router.put('/:id',validateCampground ,catchAsync(async(req, res, next)=>{
    const {id} = req.params;
    // res.send(req.body.campground);
    // console.log(req.body.campground);
    await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators:true});
    req.flash('success', 'Successfully updated the Campground');
    res.redirect(`/campgrounds/${id}`);
    // res.send(id);
}));
router.delete('/:id', catchAsync(async(req, res, next)=>{
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted the CampGround');
    res.redirect(`/campgrounds`);
}))

module.exports = router;