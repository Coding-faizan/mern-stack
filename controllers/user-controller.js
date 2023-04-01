
const User  = require('../models/user');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-errors');

const {validationResult} = require('express-validator');

const getUsers = async (req, res, next) => {
    let users;
    try {
      users = await User.find({},'-password');
    } catch (error) {
      return next(new HttpError('Fetching failed!', 500));
    }
    res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) });
  }
  

const signup = async (req,res,next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next (new HttpError('Invalid input fiels!',422));
    }

    const {name,email,password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (error) {
        return next (new HttpError(
            'Coudnt find email in db.',500
        ));
    }

    if(existingUser){
        return next (new HttpError(
            'Email exists already, login instead.',422
        ));
    }

    let hashedPassword;
    hashedPassword = await bcrypt.hash(password,12);

    const createdUser = new User ({
        name,
        email,
        image: 'asshafshjfa',
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save()
    } catch (error) {
        return next(new HttpError(
            'Sign up failed!, retry',500
        ));
    }

    let token;

    try {
        token = jwt.sign({userId: createdUser.id,
        email: createdUser.email},
        'supersecret_dont_share',
        {expiresIn:'1h'});
    } catch (error) {
        return next(new HttpError(
            'Sign up failed!, retry',500
        ));
    }

    res
    .status(201)
    .json({userId: createdUser.id,email: createdUser.email,token: token});
}

const login = async (req,res,next) =>{

    const {email,password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (error) {
        return next (new HttpError(
            'Coudnt find email in db.',500
        ));
    }

    if(!existingUser){
        return next (new HttpError(
            'Invalid Credentials, try again.',401
        ));
    }

    let isvalidpassword = false;

    try {
        isvalidpassword = await bcrypt.compare(password,existingUser.password);
    } catch (error) {
        return next (new HttpError(
            'Invalid Credentials, try again.',500
        ));
    }

    if(!isvalidpassword){
        return next (new HttpError(
            'Invalid Credentials, try again.',500
        ));
    }

    let token;

    try {
        token = await jwt.sign({userId: existingUser.id,
        email: existingUser.email},
        'supersecret_dont_share',
        {expiresIn:'1h'});
    } catch (error) {
        return next (new HttpError(
            'cannot login, try again',500
        ));
    }

    res.status(200)
    .json({
         userId: existingUser.id,
         email: existingUser.email,
         token: token
        });
}

exports.getUsers = getUsers;
exports.signup =signup;
exports.login = login;