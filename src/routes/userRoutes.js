const userRoutes = require('express').Router();
const userController = require('../controllers/userController')
const { checkEmailTaken, registrationValidation } = require('../utils/validators.utils')

// Route for user registration
// POST /register: Register a new user with input validation
userRoutes.post('/register',
    registrationValidation,
    checkEmailTaken,
    userController.register
);

// module.exports = router;


// Route for user Login
// POST /login: Login user with password validation
userRoutes.post('/login',
    registrationValidation,
    checkEmailTaken,
    userController.login
);

module.exports = userRoutes;
