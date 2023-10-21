const express = require("express");

const path = require("path");
const bodyParser = require('body-parser')

const { run } = require('./src/config/db')
const routes = require('express').Router();

const errorController = require('./src/controllers/error')
const auth = require('./src/middlewares/authenticate')

const PORT = process.env.PORT || 3000;

global.__storage = 'files_storage'
global.__basedir = __dirname;

const app = express();

// app.use(cors());
app.use(routes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message, error);
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const userRoute = require('./src/routes/userRoutes')
const fileRouter = require('./src/routes/fileRoutes');

app.use(userRoute)


// Middleware to protect routes below this point using authentication
app.use(auth) // uncomment this for authentication to be enabled

app.use(fileRouter)

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
