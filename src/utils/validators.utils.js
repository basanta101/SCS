const { check, query, validationResult } = require('express-validator');
const { client } = require('../config/db')
const db = client.db("SCS");
const users = db.collection("users");
const { body } = require('express-validator')

const loginValidator = [
  body('email', 'Invalid does not Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('password', 'The minimum password length is 6 characters').isLength({min: 6}),
]

const createValidator = [
  body('email', 'email cannot be Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('password', 'password does not Empty').not().isEmpty(),
  body('password', 'The minimum password length is 6 characters').isLength({min: 6}),
]


// Middleware to check if email is already taken
const isEmailAvailable = async (req, res, next) => {
    const { email } = req.body;
    const user = await users.findOne({ email })
    debugger
    if (user) {
        return res.status(400).json({
            status: 'Error',
            message: 'Email Taken!',
        });
    }
    next();

}

const isEmailPresentInDB = async(req, res, next) => {
    const { email } = req.body;
    const user = await users.findOne({ email })
    if(!user) {
        return res.status(400).json({
            status: 'Error',
            message: 'Email Not found!',
        });
    }
    next()
}

module.exports = { isEmailAvailable, loginValidator, createValidator, isEmailPresentInDB };

// https://medium.com/@hcach90/using-express-validator-for-data-validation-in-nodejs-6946afd9d67e
