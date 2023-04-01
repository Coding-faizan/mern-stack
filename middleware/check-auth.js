const HttpError = require("../models/http-errors");
const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>{
    try {
    const token = req.headers.authorization.split(' ')[1];

    if(!token){
        throw new Error ('You are not Athuenticated',401)
    }
    
    const deocodedToken = jwt.verify(token,'supersecret_dont_share');

    req.userData = {userId: deocodedToken.userId};
    console.log('check auth')
    return next();
    console.log('still check auth')
    } catch (error) {
        return next(
            new HttpError ('Athuentication failed',401)
        );
    }
}