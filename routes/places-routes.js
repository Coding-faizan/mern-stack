const express = require('express');
const router = express.Router();

const {check} = require('express-validator');

const placesController = require('../controllers/places-controller');
const checkAuth = require('../middleware/check-auth');

console.log('hi3');
router.get('/:pid',placesController.getPlacesById);

router.get('/user/:uid',placesController.getPlacesByUserId);

router.use(checkAuth);

router.post('/',[
    check('title').notEmpty(),
    check('description').isLength({min: 5}),
    check('address').notEmpty(),
    check('creator').notEmpty()

],placesController.createPlace);
console.log('hi');

router.patch('/:pid',[
    check('title').notEmpty,
    check('description').notEmpty
]
,placesController.updatePlace);
console.log('hi2'); 
router.delete('/:pid',placesController.deletePlace);

module.exports = router;