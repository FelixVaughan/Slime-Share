//Variables
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const userBot1 = 'Message From Bot';
const users = null;

let User = require('./user');


app.use(express.static(path.join(__dirname, 'public'))); // to get the direcotry name and load it on localhost

class room {
    constructor (id, name) {
        this.id = id
        this.name = name
    }
}

let rooms = [{id:"1",name:"room1"}]; //Array to hold IDs of all active rooms
let currentUsers = []; //Array to display all current users
let files = [];
let ids = 2;

//runs when client connects
io.on('connection', socket =>{

//--------------------- When users join room----------------------------------
    socket.on('joinRoom', (roomId, accountId, userName) => {
        console.log(`Recieved join from ${socket.id}: ${userName}`);

        //Check to see if the ID actualyl exists
        let roomExist = false;
        let currentRoom;
        for (let x in rooms) {
            if (rooms[x].id == roomId) {
                roomExist = true;
                currentRoom = rooms[x]
                break;
            }
        }

        if(roomExist) {
            let newUser = new User(userName, roomId, socket.id, accountId);

            currentUsers.push(newUser);

            socket.broadcast.to(newUser.roomId).emit('message', formatMessage(userBot1,`${newUser.name} has joined the chat`)); // display the users that joined the chat


            socket.join(newUser.roomId);

            let usersInRoom = getRoomUsers(newUser.roomId);

            io.to(newUser.roomId).emit('roomList', usersInRoom);
            io.to(newUser.sessionId).emit('displayRoom', roomId, currentRoom.name);

         
            console.log('User has join a room');


        } else {
            console.log("Failure");
            //Maybe prompt the user?
        }

        socket.emit('message', formatMessage(userBot1, 'Welcome to Slime share!')); // welcome message when user joins

       
    });

    socket.on('user-file', (userfile, filename) => {
        console.log(userfile);
        io.emit('message', userfile, filename);
    })

//--------------------- Create a room ------------------------------------------
    socket.on('createRoom', (roomName, userName, accountId) => {
        let roomId = ids.toString();
        ids = ids+1;


        let newRoom = addRoom(roomId,roomName);
        rooms.push(newRoom);



        const newUser = new User(userName, roomId, socket.id, accountId);

        currentUsers.push(newUser); 

        let usersInRoom = getRoomUsers(newUser.roomId);

        socket.join(newUser.roomId);
        io.to(newUser.roomId).emit('roomList', usersInRoom);
        console.log(roomName);
        io.to(newUser.sessionId).emit('displayRoom', roomId, roomName);
    });

    socket.on('img-file', data =>{
        console.log(data);
        //socket.emit('img-file', data);
    });




//--------------------- Listen/display for chat message ------------------------------------------
    socket.on('chatMessage', (msg) =>{
        const user = getUser(socket.id);

        io.to(user.roomId).emit('message', formatMessage(user.name ,msg)); // display the message in text
    });

//--------------------- run when client disconnected ------------------------------------------
     socket.on('disconnect', () => {
        console.log("User disconnected");
        const user = getUser(socket.id);
        console.log("user: ");
        console.log(user);
        if(typeof user !== 'undefined'){
            removeUser(user.sessionId);
            let usersInRoom = getRoomUsers(user.roomId);
            io.to(user.roomId).emit('roomList', usersInRoom);
            socket.broadcast.to(user.roomId).emit('message', formatMessage(userBot1,`${user.name} has left the chat`)); // display the users that joined the chat
        }

        // if(typeof users.roomId !== 'undefined'){
        //     let usersInRoom = getRoomUsers(user.roomId);
        // io.to(user.roomId).emit('roomList', usersInRoom);
        // }
        // let usersInRoom = getRoomUsers(user.roomId);
        // io.to(user.roomId).emit('roomList', usersInRoom);

        //Display the message that user has left the chat
        // socket.broadcast.to(user.roomId).emit('message', formatMessage(userBot1,`${user.name} has left the chat`)); // display the users that joined the chat
     });

});



// ------------------------------------------ FUNCTIONS ---------------------------------------------------------------

//Function to return an array of the users in a certain room.
//This may not work because currentUsers might not be an array? I just noticed that.
function getRoomUsers(room) {
    return currentUsers.filter(user => user.roomId === room);
}

function addRoom(id, name) {
    return {id, name};
}

// //made nav
// function getCurrentUser(id){
//     return currentUsers.find(user => user.id == id);
// }

//Function to return a user based on the socket id. (May have to fix this since it's not an array anymore.)
function getUser(uid) {
    for (let i in currentUsers) {
        if (currentUsers[i].sessionId == uid) {
            return currentUsers[i];
        }
    }
}

//Function to remove a user from the currentUser array, utilized when a socket/user disconnects.
function removeUser(id) {
    let index;  //Temporary variable to keep track of index
    for (let i in currentUsers) {  //Loop through the list of current users
        if (currentUsers[i].sessionId == id) {   //Find the id of the user to remove
            index = i;  //Set index to i
            break;
        }
    }

    currentUsers.splice(index,1);  //Remove the user from that index.
}

//This function should filter out users that match the room ID that is passed in, and return an array of those users.
function filterUser(roomId) {
    let userList = [];
    return userList.filter(user => user.roomId === roomId);
}

const PORT = 3000 || process.env.PORT; // making port number

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Listen on port number 3000