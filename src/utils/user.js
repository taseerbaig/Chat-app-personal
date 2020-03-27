const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room  }) => {

    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room){
        return {
            error: 'Username and room required'
        }
    }

    // Check for exisiting user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username

    if(existingUser){
        return {
            error: 'username is in use!'
        }
    }

    //store user
    const user = { id , username ,room }
    users.push(user)
    return {user}

}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index , 1)[0]
    }
    
}


const getUser = (id) => {
    const foundUser = users.find((user) => user.id === id)

    if(foundUser){
        return foundUser
    }

}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter ( (user) => user.room === room )
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
