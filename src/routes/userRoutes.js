const userRoutes = require('express').Router();
const userController = require('../controllers/userController')
const { loginValidator, createValidator, isEmailAvailable, isEmailPresentInDB } = require('../utils/validators.utils')

// Route for user registration
// POST /register: Register a new user with input validation
userRoutes.post('/register',
    createValidator,
    isEmailAvailable,
    userController.register
);

// module.exports = router;


// Route for user Login
// POST /login: Login user with password validation
userRoutes.post('/login',
    loginValidator,
    isEmailPresentInDB,
    userController.login
);

module.exports = userRoutes;
