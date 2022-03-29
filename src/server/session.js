//Variables to keep socket.io working correctly
//Keep in mind, javascript is camelCase kings :)

const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
let User = require('./user');
let {generateUniqueString} = require('./utils');
const app = express();
const io = socketio(server);
const server = http.createServer(app);

//So the server can see/interact with the public folder.
app.use(express.static(path.join(__dirname, 'public')));

//Other variables to help
let rooms = {}; //Array to hold IDs of all active rooms
let currentUsers = {}; //Array to display all current users
let files = [];

io.on('connection', socket => {
    

    socket.on('joinRoom', roomId, accountId, userName, () => {
        console.log(`Recieved join from ${socket.id}: ${userName}`);
        if(Object.keys(rooms).includes(roomId)){
            let newUser = new User(userName, roomId, socket.id, accountId);
            currentUsers[socket.id] = newUser; //could have also used newUser.sessionId as the key.
            socket.join(newUser.roomId);
            let userNames = Object.entries(currentUsers).map(user => user.name)
            socket.broadcast.to(newUser.roomId).emit(userNames);
            socket.emit('intializationMessage', userNames, files);
        }
        //Else reject
    });

    socket.on('createRoom', roomName, () => {
        let roomNames = Object.values(rooms).map(elem => elem[0]);
        if(roomNames.includes(roomName)){
            let roomNum = Object.keys(rooms).length;
            socket.join(roomNum);
            let roomId = generateUniqueString(Object.keys(rooms));
            rooms[roomId] = [roomName, roomNum];
            socket.emit('roomCreateSuccess', roomId);
        }
        socket.emit('roomCreateFail', null);
    });


});

