const { Router } = require('express');
const fileUpload = require("express-fileupload");
const filesPayloadExists = require('../middlewares/fileMiddlewares/filesPayloadExists');
const fileExtLimiter = require('../middlewares/fileMiddlewares/fileExtLimiter');
const fileSizeLimiter = require('../middlewares/fileMiddlewares/fileSizeLimiter');
const uploadRouter = Router();
const fileUploadController = require('../controllers/fileUploadController')
const { mockServiceToGetFileLocation } = require('../middlewares/fileMiddlewares/fetchFileLocations')

uploadRouter.post('/upload',
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.pdf']),
    fileSizeLimiter,
    fileUploadController.upload,
    // fileUploadController.uploadSameFile,
);
uploadRouter.get('/download',
// the file Id is searched in the file table, once we get that, we use it to get the file contents from the storage
mockServiceToGetFileLocation, 
fileUploadController.download 
);
// for download, the filename must be an exact match.

module.exports = uploadRouter;

// TODO: add a middleware to check if file is valid.