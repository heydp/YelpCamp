const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas.js');

const validateReview = (req, res, next) => {
  
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
    // console.log("Validating : ", result);
}


router.post('/', validateReview, catchAsync(async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError ("Invalid Campground data", 400);
    const{id} = req.params;
    const campground = await Campground.findById(id);
    const {rating, body} = req.body.review;
    const review = new Review ({rating: rating, body: body});
    campground.reviews.push(review);
    // console.log("campground :  ", campground);
    // console.log("review :  ", review);
    await campground.save();
    await review.save();
    req.flash('success', 'Successfully Created the Review');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async(req, res, next)=>{
    const{id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews:reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted the Review');
    res.redirect(`/campgrounds/${id}`);
}))



module.exports = router;