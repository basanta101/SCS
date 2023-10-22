const { createFile } = require("../models/fileModel");
const { client } = require('../config/db');
const db = client.db("SCS");
const filesCollection = db.collection("files");
const metaCollections = db.collection("metadata");
const versionsCollection = db.collection("versions");
const permissionsCollections = db.collection("permissions");

const fs = require('fs')
const path = require('path');
const rootDir = global.__basedir
const storageDir = global.__storage

const checkFileExistsInSameLocation = async (filename, destinationFolder) => {
    return await filesCollection.findOne({ filename, destinationFolder });
}

const upload = async (req, res, next) => {

    const files = req.files;
    // Iterate through each uploaded file.
    Object.keys(files).forEach(async (key) => {
        // Construct the initial file path for the uploaded file.
        let filepath = '';
        const file = files[key]
        const { name: filename, mimetype: fileMIMEType, encoding: fileEncoding } = file
        const { destination: destinationFolder, user, access } = req.query

        const fileExistsInSameLocation = await checkFileExistsInSameLocation(filename, destinationFolder)
        // file being uploaded to a destination folder for the first time.
        if (!fileExistsInSameLocation) {
            const newFile = createFile({
                filename,
                // uploadDate,
                destinationFolder,
            });

            const { insertedId: fileId } = await filesCollection.insertOne(newFile);
            await metaCollections.insertOne({ fileId, fileMIMEType, fileEncoding });
            await versionsCollection.insertOne({ destinationFolder, filename, versions: { v1: fileId } });
            await permissionsCollections.insertOne({ fileId, owner: user, filename, access });
            const [, fileExt] = filename.split('.')
            filepath = path.join(rootDir, storageDir, `${fileId}.${fileExt}`); // the filename will be stored using fileId, to prevent name collisions
        }

        if (fileExistsInSameLocation) {
            // Create a new version number
            const uploadDate = new Date();
            const currentVersion = await versionsCollection.findOne({ destinationFolder, filename });
            const newVersion = Object.keys(currentVersion.versions).length + 1;
            const [fileBaseName, fileExt] = filename.split('.');
            const newFileName = `${fileBaseName}_${newVersion}.${fileExt}`;

            // Create a new file document and insert it
            const newFile = createFile({
                filename: newFileName,
                destinationFolder
            });
            const { insertedId: fileId } = await filesCollection.insertOne(newFile);

            // Insert metadata and permissions
            await metaCollections.insertOne({ fileId, fileMIMEType, fileEncoding, uploadDate, filename: newFileName });
            await permissionsCollections.insertOne({ fileId, owner: user, filename: newFileName, access });

            // Store the new version
            await versionsCollection.updateOne(
                { destinationFolder, filename },
                {
                    $set: {
                        ...currentVersion,
                        versions: {
                            ...currentVersion.versions,
                            [`v${newVersion}`]: fileId,
                        },
                    },
                }
            );
            filepath = path.join(rootDir, storageDir, `${fileId}.${fileExt}`);
        }


        // Move the uploaded file to the specified 'filepath'.
        files[key].mv(filepath, (err) => {
            console.log('moving file');
            if (err) {
                // If there's an error during the file move, send a 500 error response.
                return res.status(500).json({ status: "error", message: err });
            }
        });
    });

    return res.status(201).json({ status: 'success', message: 'Upload Successful' });

};

// Download from storage
const download = (req, res) => {
    const fileName = req.query.filename;
    if (!fileName) {
        return res.status(400).json({ status: 'error', message: 'Missing filename in query parameters' });
    }
    const [, fileExt] = req.query.filename.split('.')
    const storageFileName = `${req.fileId}.${fileExt}`
    const filePath = path.join(rootDir, storageDir, storageFileName);
    // Check if the file exists in the storage.
    const isFilePresent = fs.existsSync(filePath);
    if (!isFilePresent) {
        return res.status(404).send({ message: 'File not found in storage' });
    }
    return res.download(filePath);
};

const search = async (req, res, next) => {
    const { filename, destination: destinationFolder, startIndex = 0, endIndex = 1, noOfRecords = 10, user } = req.query

    try {

        // all the files that 
        const allFiles = await permissionsCollections.aggregate([
            {
                $lookup: {
                    from: 'files',
                    localField: "fileId",
                    foreignField: "_id",
                    as: "filePermissions",
                }
            },
            {
                $project: {
                    _id: 1,
                    access: 1,
                    owner: 1,
                    filename: 1,
                }
            },
            {
                $match: {
                    filename, // uncomment if exact file name match is required
                    $or: [{ owner: user }, { access: 'public' }],
                }
            }
        ]).toArray()
        return res.status(200).send({ files: allFiles })


    } catch (err) {
        console.log('error', err)
        return res.status(500).send({ message: err.message, status: 'Something went wrong' })
    }
}

// list: list all the file uploaded by the user.
// select files where user is owner
const list = async (req, res) => {
    try {
        const { user } = req.query
          const allFilesUploadedByUser = await permissionsCollections.aggregate([
            {
                $lookup: {
                    from: 'files',
                    localField: "fileId",
                    foreignField: "_id",
                    as: "filePermissions",
                }
            },
            {
                $project: {
                    _id: 1,
                    access: 1,
                    owner: 1,
                    filename: 1,
                }
            },
            {
                $match: { owner: user }

            }
        ]).toArray()
        if(!allFilesUploadedByUser) {
            return res.status(404).send({ message: 'No files seem to be uploaded' })
        }    
        return res.status(200).send({ files: allFilesUploadedByUser })
    } catch (err) {
        return res.status(500).send({ err, messages: 'Something went wrong' })
    }
}


// this code just exists for helping in debug.
const clearAll = async (req, res) => {
    try {
        await filesCollection.deleteMany()
        await metaCollections.deleteMany()
        await versionsCollection.deleteMany()
        await permissionsCollections.deleteMany()

        const dir = 'files_storage'
        fs.rmdirSync(dir, { recursive: true, force: true })
        return res.status(200).send({ message: 'all file data cleared' })
    } catch (err) {
        return res.status(500).send({ message: err.message })
    }

}

module.exports = {
    upload,
    download,
    search,
    list,
    clearAll
};
