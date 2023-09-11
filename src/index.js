const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage, generateLocation} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', function(socket){
    console.log('New WebSocket connection established')
    
    socket.on('join', function({username, room}, callback){
        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(user.username, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', function(message, callback){
        const filter = new Filter()

        const user = getUser(socket.id);

        if(filter.isProfane(message)) return callback('Profanity is not allowed')

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback()
    })

    socket.on('sendLocation', function(coords, callback){
        const user = getUser(socket.id);
        
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', function(){
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', generateMessage(user.username + ' has left'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }   
    })
})



server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})