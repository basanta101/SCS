const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { client } = require('../config/db')
const db = client.db("SCS");
const users = db.collection("users");


const login = async (req, res) => {
    try {
        debugger
        const [user] = await users.find({ email: req.body.email }).toArray();

        if (!user.email) {
            // User not found, return an error response
            const err = new Error('User Not Found!')
            err.status = 400;
            throw err;
        }
        bcrypt.compare(req.body.password, user.password, function (err, response) {
            if (err) {
                // handle error
                console.log('error')
                throw err;
            }

            if (response) {
                const tokenPayload = {
                    email: user.email,
                };
                const accessToken = jwt.sign(tokenPayload, 'SECRET');
                return res.status(201).json({
                    status: 'success',
                    message: 'User Logged In!',
                    data: {
                        accessToken,
                    },
                });

                

            } else {
                // response is OutgoingMessage object that server response http request
                return response.json({ success: false, message: 'passwords do not match' });
            }

        });

    } catch (err) {
        res.status(500).send()
    }
}


const register = async (req, res) => {
    // Check for validation errors
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({
    //         status: 'fail',
    //         message: 'Validation error',
    //         errors: errors.array(),
    //     });
    // }

    try {
        debugger
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = { email, password: hashedPassword };
        users.insertOne(user);
        // users.push(user);

        res.status(201).json({
            status: 'success',
            message: 'User Registered!',
            data: {
                user: {
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
}

module.exports = {
    register,
    login
}