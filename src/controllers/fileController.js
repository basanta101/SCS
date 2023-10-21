// const uploadFile = require("../middlewares/upload");
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

// This function appends a version number to a file path if a file with the same name already exists.
const appendVersion = (filePath) => {
    // Extract the file extension (e.g., .txt, .jpg) from the file path.
    const fileExtension = path.extname(filePath);

    // Extract the base name (filename without extension) from the file path.
    const fileBaseName = path.basename(filePath, fileExtension);

    // Initialize a version number.
    let version = 1;

    // Check if a file with the same name already exists in the specified path.
    while (fs.existsSync(filePath)) {
        // Increment the version number for the next iteration.
        version++;

        // Construct a new filename by appending the version number to the base name.
        const newFileName = `${fileBaseName}_${version}${fileExtension}`;

        // Update the file path with the new filename.
        filePath = path.join(rootDir, storageDir, newFileName);

    }

    // Return the unique file path.
    return filePath;
};

const upload = async (req, res, next) => {

    const files = req.files;

    console.log('upload controller reached', req.query.destination)


    // Iterate through each uploaded file.
    Object.keys(files).forEach(async (key) => {
        // Construct the initial file path for the uploaded file.
        let filepath = path.join(rootDir, storageDir, files[key].name);
        debugger
        const file = files[key]
        const filename = files[key].name
        const destinationFolder = req.query.destination
        const currentUser = req.query.user
        const fileAccessType = req.query.access;
        const fileMIMEType = file.mimetype; // MIME type of the file
        const fileEncoding = file.encoding;
        const fileExistsInSameLocation = await checkFileExistsInSameLocation(filename, destinationFolder)
        debugger
        if (!fileExistsInSameLocation) {
            // await createNewFileEntry({ currentUser, destinationFolder, metadata});
            const uploadDate = new Date();
            const newFile = createFile({
                filename,
                uploadDate,
                owner: currentUser,
                destinationFolder,
                access: fileAccessType
            });


            const { insertedId: fileId } = await filesCollection.insertOne(newFile);
            await metaCollections.insertOne({ fileId, fileMIMEType, fileEncoding, filename, access: fileAccessType });
            await versionsCollection.insertOne({ destinationFolder, filename, versions: [{ versionNumber: 1, uploadDate, fileId, filename }] });
            await permissionsCollections.insertOne({ fileId, owner: currentUser, filename: filename, access: fileAccessType });
        }


        // CASE: file being created in same destinationFolder by user/client
        // 1. First we add the file to storage
        // 2. than we add the file info to mongo
        const fileExistsInStorage = fs.existsSync(filepath)
        // Check if a file with the same name already exists in the specified directory.
        if (fileExistsInStorage && fileExistsInSameLocation) {
            // If the file exists, use the 'appendVersion' function to get a unique filename.
            filepath = appendVersion(filepath);
        }

        if (fileExistsInSameLocation) {
            // Create a new version number
            const uploadDate = new Date();
            const currentVersion = await versionsCollection.findOne({ destinationFolder });
            debugger
            const newVersion = currentVersion.versions.length + 1;
            const [fileBaseName, fileExt] = filename.split('.');
            const newFileName = `${fileBaseName}_${newVersion}.${fileExt}`;

            // Create a new file document and insert it
            const newFile = createFile({
                filename: newFileName,
                owner: currentUser,
                destinationFolder,
                access: fileAccessType
            });
            const { insertedId: fileId } = await filesCollection.insertOne(newFile);

            // Insert metadata and permissions
            await metaCollections.insertOne({ fileId, fileMIMEType, fileEncoding, uploadDate, filename: newFileName });
            await permissionsCollections.insertOne({ fileId, owner: currentUser, filename: newFileName });

            // Store the new version
            await versionsCollection.updateOne(
                { destinationFolder },
                {
                    $set: {
                        ...currentVersion,
                        versions: [
                            ...currentVersion.versions,
                            { versionNumber: newVersion, uploadDate, fileId, filename: newFileName },
                        ],
                    },
                }
            );
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

    return res.status(201).json({ status: 'success', message: Object.keys(files).toString() });

};

// Download from storage
const download = (req, res) => {
    const fileName = req.query.filename;
    if (!fileName) {
        return res.status(400).json({ status: 'error', message: 'Missing filename in query parameters' });
    }
    const filePath = path.join(rootDir, storageDir, fileName);
    // Check if the file exists in the specified directory.
    const isFilePresent = fs.existsSync(filePath);
    if (!isFilePresent) {
        return res.status(404).send({ message: 'File not found in storage' });
    }
    return res.download(filePath);
};


const search = async (req, res, next) => {

    try {
        // get the filename and destination from req.query
        const { filename, destination, startIndex = 0, endIndex = 1, noOfRecords = 10, user } = req.query
        // for a particular folder, a user can only view public files and his own files

        // get all the files that are present in the folder requested(destination)
        // applying a filter i.e a user can only view public files and his own files present in a folder
        const filesFetchedForUser = await filesCollection
            .find({ filename, destinationFolder: destination, $or: [{ owner: user }, { access: 'public' }] }).toArray()
        // {filename: 'HLD_1.pdf', destinationFolder: "/staging/assets", $or: [{ owner: "bruce@wayne.com" }, { access: "public"}]}
        debugger
        return res.status(200).send({ files: filesFetchedForUser })


    } catch (err) {
        return res.status(500).send({ message: err.message, status: 'Something went wrong' })
    }
}

module.exports = {
    upload,
    download,
    search
};
