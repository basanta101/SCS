exports.createUser = (user) => {
    const {username, email, password, role, } = user;
    return {
        username,
        email,
        password,
        // role
    }
}

/* 
{
    username, 
    email,
    password,
    role // SUPER_ADMIN, ADMIN, 
}


*/