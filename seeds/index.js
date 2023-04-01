const mongoose = require('mongoose');
async function dbConnMain(){
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp', {
            useNewUrlParser: true, 
            // useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log("Connected successfully to the Mongodb")
      } 
      catch (error) {
        console.log("The Mongo connection err is : ", error)
        return;
      }
}
dbConnMain();

const Campground = require('../models/campground');
const Cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30) + 10;
        const camp = new Campground({
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero consequatur repudiandae, sapiente eveniet magni sit et ipsum, quam cumque magnam id voluptatum veniam, ea corporis. Explicabo architecto voluptatem quo fuga.',
            price: price
        })
        await camp.save();
    }
};
seedDB().then(()=>{
    mongoose.connection.close();
});

