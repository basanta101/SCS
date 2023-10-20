const createVersion = (newVersion) => {
    const { fileName, fileLocation, fileId } = newVersion
    const versionNumber = ''
    return {
        
        fileName, // added only when the file is created.
        fileLocation, // Location where the file is stored, and all its versions, by the client
        versions: [{
            versionNumber,
            fileId
        }], // List of versions
    }
}

/* Schema for version
{
        
        fileName: 'sample.pdf',
        fileLocation: '/prod/assets/', // Location where the file is stored, and all its versions, by the client
        versions: [
            {
                versionNumber: 1, // Version number (1 for the initial version)
                fileId: 'file_123', // id of a file, obtained after uploading.
            },
            {
                versionNumber: 2, // Version number (incremental number)
                fileId: 'file_234', // id of a file, obtained after uploading.
            }
            // ... more version entries for the same file
        ], // List of versions
    }
*/