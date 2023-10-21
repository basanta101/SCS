const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { client } = require('../config/db')
const db = client.db("SCS");
const users = db.collection("users");

const register = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
    }
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = { email, password: hashedPassword };
        users.insertOne(user);

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

const login = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
    }
    try {
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
                return res.status(500).json({ status: 'error', message: 'Something went wrong' });
            }
            debugger
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
                return res.status(400).json({ status: 'error', message: 'Wrong Password' });
            }

        });

    } catch (err) {
        res.status(500).send()
    }
}

module.exports = {
    register,
    login
}
