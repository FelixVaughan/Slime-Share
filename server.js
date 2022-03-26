//Variables to keep socket.io working correctly
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const io = socketio(server);
const server = http.createServer(app);

//So the server can see/interact with the public folder.
app.use(express.static(path.join(__dirname, 'public')));

//Other variables to help
let rooms = []; //Array to hold IDs of all active rooms
let current_users = []; //Array to display all current users

io.on('connection', socket => {
    //Console log for when a user connects
    console.log("New connection!");




    // For when a user disconnects
    socket.on('disconnect', () => {
        console.log("User disconnected");
        //Remove user
    });


    socket.on('join', room_id => {
        console.log("Server processing room join");
        //If room id exists then join
        //Else reject
    });

    socket.on('createRoom', room_name => {
        console.log("Server processing room creation");
        //Do checks here e.g. if name is valid
        //If valid then create a room
    });


});