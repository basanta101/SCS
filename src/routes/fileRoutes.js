const fileRouter = require('express').Router();
const fileUpload = require("express-fileupload");
const filesPayloadExists = require('../middlewares/fileMiddlewares/filesPayloadExists');
const fileExtLimiter = require('../middlewares/fileMiddlewares/fileExtLimiter');
const fileSizeLimiter = require('../middlewares/fileMiddlewares/fileSizeLimiter');
const fileController = require('../controllers/fileController')
const { checkPermissionsForFileDownload } = require('../middlewares/fileMiddlewares/fetchFileLocations')

fileRouter.post('/upload',
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.pdf', '.txt']),
    fileSizeLimiter,
    fileController.upload,
);
fileRouter.get('/download',
    // the file Id is searched in the file table, once we get that, we use it to get the file contents from the storage
    checkPermissionsForFileDownload,
    fileController.download
);
// for download, the filename must be an exact match.

fileRouter.get('/files',
    fileController.search)
// filename and location must be an exact match    

module.exports = fileRouter;

// TODO: add a middleware to check if file is valid.