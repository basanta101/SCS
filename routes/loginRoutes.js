const loginRoutes = require('express').Router();

const loginController = require('../controllers/loginController')
// const router = Router();

const { checkEmailTaken, registrationValidation } = require('../utils/validators.utils')

// Define the POST route for user registration
// POST /register: Register a new user with input validation
loginRoutes.post('/login',


    // registrationValidation,
    // checkEmailTaken,
    loginController.login
);

module.exports = loginRoutes;

// TODO: the validations are to be uncommented and use.
