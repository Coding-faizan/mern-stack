const HttpError = require('../models/http-errors');
const mongoose = require('mongoose');



const {validationResult} = require('express-validator');

const Place = require('../models/place');
const User = require('../models/user');

const getCoordsForAddress = require('../util/location');

const getPlacesById = async (req,res,next)=>{
    
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (error) {
        return next (new HttpError(
            'Something went wrong!',500
        ));
    }

    if(!place){
        return next (new HttpError(
            'Place not found with this id',404
        ));    
    }
    res.json({place: place.toObject({getters: true}) });
}

const getPlacesByUserId = async (req,res,next) =>{
    const userId = req.params.uid;

    let places;

    try {
        places = await Place.find({creator: userId})
    } catch (error) {
        return next (new HttpError(
            'Place not found with this user id',404
        ));
    }

    if(!places || places.length === 0){
        return next(new HttpError('places not found with this user id',404));
    }

    res.json({places});
}

const createPlace = async (req,res,next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next( new HttpError('Invalid inputs passed!',422));
    }
    
    const {title,description,address,creator} = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress();
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        image: 'https://en.wikipedia.org/wiki/Lahore#/media/File:Lahore_collage.jpg',
        location: coordinates,
        address,
        creator
    });

    let user;

    try {
        user = await User.findById(creator)    
    } catch (error) {
        return next(new HttpError (
            'Coudnt create place, try again',500
        ));
    }

    if(!user){
        return next(new HttpError (
            'user not found with this id',404
        ));
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();

    } catch (err) {
        
        const error = new HttpError(
            'Creating place failed, retry.',500
        );
        return next(error);
    }

    res.status(201).json({place: createdPlace});
}
console.log('hi4');
const updatePlace = async (req, res, next) => {
        try {
        console.log('called');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
          );
        }
      
        const { title, description } = req.body;
        const placeId = req.params.pid;
            
        let place;
        try {
            place = await Place.findById(placeId);
        } catch (err) {
          const error = new HttpError(
            'Something went wrong, could not update place.',
            500
          );
          return next(error);
        }
        
        if (place.creator.toString() !== req.userData.userId) {
            const error = new HttpError(
                'You are not allowed to edit this place.',
                401
                );
                return next(error);
            }
            
            place.title = title;
            place.description = description;
            
            try {
                await place.save();
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not update place.',
                    500
                    );
                    return next(error);
                }
                
                res.status(200).json({ place: place.toObject({ getters: true }) });
            
                
            } catch (error) {
                console.log(error);
            }
        };
    
        
        
    const deletePlace = async (req,res,next) =>{
    const placeId = req.params.pid;

    let place;
    
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (error) {
        return next(new HttpError(
            'Coudnt find, please try again',500
        ));
    }

    if(!place){
        return next ( new HttpError (
            'Couldnt find place with this id',404
        ));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    
    } catch (error) {
        return next(new HttpError(
            'Couldnt remove place.',500
        ));
    }
    
    res.status(200).json({message: "Deleted!"});
}


exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
