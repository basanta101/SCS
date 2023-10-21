const { client } = require('../../config/db');
const { FILE_ACCESS_TYPE } = require('../../constants');
const db = client.db("SCS");
const filesCollection = db.collection("files");


// A mock function that takes the filename and looks for a file match,
// where the file was stored by the client/user
exports.checkPermissionsForFileDownload = async (req, res, next) => {
    // Get the file location
    const { filename, destination, user } = req.query;
    if (!filename || !destination) {
        return res.status(400).send({ message: 'filename and destination required', status: 'error' })
    }
    try {
        const file = await filesCollection.findOne({ filename: req.query.filename, destinationFolder: req.query.destination })
        if (!file) {
            return res.status(404).send({ message: 'File not found' })
        }
        // A user can download a file only if
        // 1. user is owner of file
        // 2. file access type is public
        const isUserFileOwner = file.owner === user;
        const isFilePublic = file.access === FILE_ACCESS_TYPE.PUBLIC
        if(!isUserFileOwner && !isFilePublic) {
            return res.status(403).send({ message: 'Permission Denied' })
        }
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
    next()
}