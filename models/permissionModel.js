exports.createPermission = (permissions) => {
    const { fileId, fileName, accessType, owner, users } = permissions
    return {
        fileId,
        fileName,
        accessType,
        owner,
        users,
    }

}


/* 
SCHEMA FOR PERMISSION AND ROLE BASED ACCESS CONTROL 
TYPES OF ROLES
SUPER_ADMIN: [read, write, delete, rename, etc]
ADMIN: [read, write]
VIEWER: [read]

{
        fileId: 'file Id obtained, after creating the file',
        fileName: 'filename, with version if any',
        owner: {
            userId: '123',
            email: 'bruce@wayne.com'
        },
        accessType: private, // private, group, global
        users: [
            {
                name: 'user1',
                userId: 'abc',
                accessLevel: SUPER_ADMIN
            },
            {
                name: 'user2',
                userId: 'abc',
                accessLevel: ADMIN
            },
            {
                name: 'user3',
                userId: 'abc',
                accessLevel: VIEWER
            },

        ] 
    }
*/