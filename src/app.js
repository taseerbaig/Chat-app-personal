const path = require('path')
const express = require('express')
const hbs = require('hbs')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {generateLocation} = require('./utils/locations')
const {addUser , removeUser , getUser , getUsersInRoom} = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

//Paths
const publicDirectoryPath = path.join(__dirname , '../public')

//setup static directory to serve
app.use (express.static(publicDirectoryPath))

io.on('connection' , (socket) => {
    console.log('new socket connection!')

    socket.on('join' ,( options , callback) => {

        const {error , user} = addUser({id: socket.id , ...options})

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message' , generateMessage('Admin ','Welcome'))
        socket.broadcast.to(options.room).emit('message' , generateMessage(user.username , ' has joined! ' ))

        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    
        //io.to.emit [ emit everybody in a specific room ], 
        //socket.broadcast.to.emit

    })

    socket.on('response' , (res_mess , callback) => {

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(res_mess)){
            return callback('bad words')
        }

        io.to(user.room).emit('message' , generateMessage(user.username , res_mess))
        callback()
    })


    socket.on('location' , (loc , callback) => {
        const user = getUser(socket.id)

        const lat = loc.lat
        const long = loc.long
        io.to(user.room).emit('locmes' , generateLocation(user.username , 'https://google.com/maps?q=' + lat + ',' + long))
        callback('Location Received!')
    })

    socket.on('disconnect' , () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message' , generateMessage( `${user.username} has left`))
            io.to(user.room).emit('roomData' , {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }

    })
})

app.get('' , (req , res) => {
    res.render('index' , {
        title: 'Chat-app',
        name:'Taseer Baig'
    })
})

server.listen(port , () => {
    console.log('server is up on port' + port)
})
