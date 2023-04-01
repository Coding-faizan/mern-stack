const express = require('express');
const bodyParser = require('body-parser');

const HttpError = require('./models/http-errors');

const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');


const app = express();

app.use(bodyParser.json());

console.log('bef route');

app.use('/api/places',placesRoutes);

app.use('/api/users',userRoutes);

app.use((req,res,next) =>{
    const error = new HttpError("Could not find route",404);
    throw (error);
})

app.use((error,req,res,next)=>{
    if(res.headerSent){
        return next(error);
    }
    res.
    status(error.code || 500).
    json({message: error.message || "an unknown error ocurred"});
});

mongoose
.connect('mongodb+srv://faizan:123@cluster0.wzvkmrt.mongodb.net/places?retryWrites=true&w=majority')
.then(()=>{
    app.listen(5000);
})
.catch(err =>{
    console.log(err);
})