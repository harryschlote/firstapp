const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

//connecting to the database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

//check if its connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

//pass in array and return a random element
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '67328fb443adee97a336ae4c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Here is a default description for the campsite.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: {
                url: "http://res.cloudinary.com/donug4rvf/image/upload/v1731862230/YelpCamp/imzupoxebpb4mogx4zuh.jpg",
                filename: "YelpCamp/imzupoxebpb4mogx4zuh"
            }
        })
        await camp.save();
    }
}

//runs the seed process, then closes the connection once the DB is seeded
seedDB().then(() => {
    mongoose.connection.close();
})

