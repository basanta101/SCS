const { client } = require('../../config/db')
const db = client.db("SCS");
const filesCollection = db.collection("files");


// A mock function that takes the filename and returns file match,
// where the file was stored by the client/user
exports.mockServiceToGetFileLocation = async (req, res, next) => {
    // Get the file location
    const { filename, destination } = req.query;
    if (!filename || !destination) {
        return res.status(400).send({ message: 'filename and destination required', status: 'error' })
    }
    try {
        const file = await filesCollection.find({ filename: req.query.filename, destinationFolder: req.query.destination })
        debugger
        if (!file) {
            return res.status(404).send({ message: 'File not found' })
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message })
    }
    next()
}