const { Router } = require('express');

const registerController = require('../controllers/registerController')
const router = Router();

const { checkEmailTaken, registrationValidation } = require('../utils/validators.utils')

// Define the POST route for user registration
// POST /register: Register a new user with input validation
router.post('/register',

    // registrationValidation,
    // checkEmailTaken,
    registerController.register 
);

module.exports = router;

// TODO: the validations are to be uncommented and use.
// TODO: the user should be created using a user model.