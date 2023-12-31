const users = []

const addUser = function({id, username, room}){
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room) return {
        error: 'Username and room are required!'
    }

    const exixtingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })

    if(exixtingUser){
        return {
            error: 'Username is in use!'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = function(id){
    const index = users.findIndex((user) => {
        return user.id === id;
    })

    if(index != -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = function(id){
    return users.find((user) => user.id === id)
}

const getUsersInRoom = function(roomId){
    return users.filter((user) => user.room === roomId)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}