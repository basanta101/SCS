const createVersion = (newVersion) => {
    const { fileName, fileLocation, fileId } = newVersion
    return {
        fileName, // added only when the file is created.
        // fileLocation, // Location where the file is stored, and all its versions, by the client
        versions : {
            v1: fileId
        }, // List of versions
    }
}

/* Schema for version
{
        
        fileName: 'sample.pdf',
        fileLocation: '/path/to/file'
        versions:
            {
                v1: fieldId1,
                v2: fieldId2
                // ... more version entries for the same file
            },
    }
*/