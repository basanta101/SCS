exports.createFile = (file) => {
    const { filename, owner, destinationFolder, access } = file
    return {
        //_id: fileId, // unique id of each file, created for every version by mongo
        filename, // filename 
        destinationFolder, // the location where the client stored the file
    }
}



/* 
{
    fileId: 'file123', // unique id of each file, created for every version
    filename: 'sample.pdf', // filename, including version if any, sample_1.pdf, sample_2.pdf
    destinationFolder,
    
}

*/

// TODO:this can be done using mongoose
