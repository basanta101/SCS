const express = require("express");

const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser')

const { run } = require('./config/db')
const routes = require('express').Router();
// const fileUpload = require("express-fileupload");
// const filesPayloadExists = require('./middlewares/fileMiddlewares/filesPayloadExists');
// const fileExtLimiter = require('./middlewares/fileMiddlewares/fileExtLimiter');
// const fileSizeLimiter = require('./middlewares/fileMiddlewares/fileSizeLimiter');

const errorController = require('./controllers/error')
const auth = require('./middlewares/authenticate')

const PORT = process.env.PORT || 3000;

global.__storage__ = 'files'
global.__basedir = __dirname;

const app = express();

// app.use(cors());
app.use(routes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json());

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message, error);
    // console.log('unhandledRejection', error.message);
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const registerRoute = require('./routes/registerRoutes')
const loginRoute = require('./routes/loginRoutes')
const uploadRoute = require('./routes/uploadRoutes')

app.use(registerRoute)
app.use(loginRoute)


// Middleware to protect routes below this point using authentication
// app.use(auth) // uncomment this for authentication to be enabled

app.use(uploadRoute)

app.listen(process.env.PORT || PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running and App is listening on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
    }
  );


app.use(errorController.get404)

run().catch(console.dir) 

// SECURITY BEST PRACTICES CHECK
// VULNERABILITY CHECKS
// MONITORING AND LOGGING
// CODE QUALITY (LLD)
// PERFORMANCE CHECK 
// UNIT TEST IF POSSIBLE
// run eslint and




// reference for upload and download
// https://github.com/gitdagray/node_file_uploader
