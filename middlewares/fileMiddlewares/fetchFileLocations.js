const { client } = require('../../config/db')
const db = client.db("SCS");
const files = db.collection("files");


// A mock function that takes the filename and returns the path(string),
// where the file was stored by the client/user
exports.mockServiceToGetFileLocation = async(req, res, next) => {
    // Get the file location
    const file = await files.findOne({ filename: req.query.filename })
    debugger
    if(!file){
        return res.status(404).send({ message: 'File not found' })
    }
    // return res.status(200).send({ message: 'Reached eher'})
    next()
}