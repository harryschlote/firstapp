const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');


module.exports.index = (async (req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds});
})

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    //make campground
    const campground = new Campground(req.body.campground);
    //add geometry from geocoding api
    campground.geometry = geoData.body.features[0].geometry;
    //loop over files and make array containing path and filename of images
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    //associating the campground being created with the logged in user who creates it
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','You just made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate(
        {path: 'reviews',
            populate: {
                path: 'author'
        }}).populate('author');
    if(!campground) {
        req.flash('error','Cannot find campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error','Cannot edit a non-existant campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req,res) => {
    console.log(req.body);
    const userCampground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground})
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    userCampground.images.push(...images);
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await userCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    await userCampground.save();
    req.flash('success','You just updated a campground!')
    res.redirect(`/campgrounds/${userCampground._id}`);
}

module.exports.deleteCampground = async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted a campground')
    res.redirect('/campgrounds');
}