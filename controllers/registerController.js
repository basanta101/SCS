const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { client } = require('../config/db')

const db = client.db("SCS");
const users = db.collection("users");

exports.register = async (req, res) => {
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