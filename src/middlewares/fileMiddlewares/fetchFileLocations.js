const { client } = require('../../config/db');
const { FILE_ACCESS_TYPE } = require('../../constants');
const db = client.db("SCS");
const filesCollection = db.collection("files");
const permissionsCollection = db.collection("permissions");


// A user can download a file only if 1. user is owner of file, 2. file access type is public
exports.checkPermissionsForFileDownload = async (req, res, next) => {
    const { filename, destination, user } = req.query;
    if (!filename || !destination) {
        return res.status(400).send({ message: 'filename and destination required', status: 'error' })
    }
    try {
        const file = await filesCollection.findOne({ filename: req.query.filename, destinationFolder: req.query.destination })
        if (!file) {
            return res.status(404).send({ message: 'File not found' })
        }

        const fileId = file._id
        const filePermissions = await permissionsCollection.findOne({ fileId })
        const isUserFileOwner = filePermissions.owner === user;
        const isFilePublic = filePermissions.access === FILE_ACCESS_TYPE.PUBLIC

        if(!isUserFileOwner && !isFilePublic) {
            return res.status(403).send({ message: 'Permission Denied' })
        }
        req.fileId = fileId
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
    next()
}