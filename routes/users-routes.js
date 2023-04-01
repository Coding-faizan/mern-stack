const express = require('express');
const router = express.Router();

const {check} = require('express-validator');

const userController = require('../controllers/user-controller');

router.get('/',userController.getUsers);

router.post('/signup',[
    check('name').notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 6}),
],userController.signup);

router.post('/login',userController.login);

module.exports = router;