const express = require("express");
const fs =require("fs");
const morgan = require('morgan')
const cors = require('cors')
const path = require("path");
const bodyParser = require('body-parser')

const { run } = require('./src/config/db')
const routes = require('express').Router();
const errorController = require('./src/controllers/error')
const auth = require('./src/middlewares/authenticate')
const rateLimit = require("express-rate-limit");


const PORT = process.env.PORT || 3000;

global.__storage = 'files_storage'
global.__basedir = __dirname;

const app = express();

let rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
    message: {
        error: {
            code: 429,
            message: "Too Many Requests",
            description: "We're sorry, but you have exceeded the maximum number of requests allowed. Please try again later."
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))
app.use(rateLimiter);
app.use(cors());
app.use(routes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userRoute = require('./src/routes/userRoutes')
const fileRouter = require('./src/routes/fileRoutes');

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message, error);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use(userRoute)

app.use(auth) // Middleware to protect routes below this point using authentication

app.use(fileRouter)

app.listen(process.env.PORT || PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running and App is listening on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
}
);


app.use(errorController.get404)

run().catch(console.dir)

