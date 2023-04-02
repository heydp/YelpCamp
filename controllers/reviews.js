const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError ("Invalid Campground data", 400);
    const{id} = req.params;
    const campground = await Campground.findById(id);
    const {rating, body} = req.body.review;
    const review = new Review ({rating: rating, body: body});
    review.author = req.user._id;
    campground.reviews.push(review);
    // console.log("campground :  ", campground);
    // console.log("review :  ", review);
    await campground.save();
    await review.save();
    req.flash('success', 'Successfully Created the Review');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async(req, res, next)=>{
    const{id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews:reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted the Review');
    res.redirect(`/campgrounds/${id}`);
};