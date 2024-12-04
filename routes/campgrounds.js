const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const  {storage} = require('../cloudinary');
//destination for image uploads
const upload = multer({storage});

router.route('/')
    //get all the campgrounds
    .get(catchAsync(campgrounds.index))
    //send the data from the form
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


//serves the form on the new page
//NOTE - this must be above the router.get('/campgrounds/:id' otherwise it will treat "new" as an id
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    //showing an individual campground page
    .get(catchAsync(campgrounds.showCampground))
    //update (edit) a campground with the form data and replace the old version in the database
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//route that serves the form to edit a campsite
router.get('/:id/edit',  isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;

