const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res, next)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds:campgrounds});

};
module.exports.renderNewForm = async(req, res)=>{
    console.log("Getting new form for campground");
     res.render('campgrounds/new');
 };
 module.exports.createCampground = async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError ("Invalid Campground data", 400);
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    // console.log(geoData.body.features[0].geometry.coordinates);

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url:f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log("The campground is : ",campground);
    req.flash('success', 'Successfully created a new Campground');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async(req, res, next)=>{
    const {id} = req.params;
    // console.log("Getting new campground" , id);
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground);
    if(!campground){
        req.flash('error', "Cannot find that Campground");
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/show', {campground:campground});

};

module.exports.renderEditForm = async(req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find that Campground");
        res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit', {campground:campground});
}

module.exports.updateCampground = async(req, res, next)=>{
    const {id} = req.params;
    // console.log("The campground info is : ", campground);
    // console.log("The req info is : ", req.user._id);
   
    // res.send(req.body.campground);
    // console.log("The req is : ",req.body);
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators:true});
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}));
    campground.images.push(...imgs);

    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated the Campground');
    res.redirect(`/campgrounds/${id}`);
    // res.send(id);
}

module.exports.deleteCampground = async(req, res, next)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted the CampGround');
    res.redirect(`/campgrounds`);
};