const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let User = require('./user');
// set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/chatpage', (req, res) => {
//     res.sendFile('index.html', { root: path.join(__dirname, 'public') });
// });

app.use(express.static(path.join(__dirname, 'public')));

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
            console.log("WOOOO!");
            let newUser = new User(userName, roomId, socket.id, accountId);

            currentUsers.push(newUser);

            socket.join(newUser.roomId);

            let usersInRoom = getRoomUsers(newUser.roomId);

            //let userNames = Object.entries(currentUsers).map(user => user.name)

            //console.log(usersInRoom);

            io.to(newUser.roomId).emit('roomList', usersInRoom);
            io.to(newUser.sessionId).emit('displayRoom', roomId, currentRoom.name);

            console.log(currentUsers);
            // socket.broadcast.to(newUser.roomId).emit(userNames);
            //socket.emit('intializationMessage', userNames, files);
            console.log('User has join a room');

        } else {
            console.log("Failure");
            //Maybe prompt the user?
        }
       
    });


    socket.on('createRoom', (roomName, userName, accountId) => {
        //let roomNames = Object.values(rooms).map(elem => elem[0]);
        //let roomId = generateUniqueString(Object.keys(rooms));
        let roomId = ids.toString();
        ids = ids+1;

        console.log(rooms);

        let newRoom = addRoom(roomId,roomName);
        rooms.push(newRoom);

        console.log(rooms);

        const newUser = new User(userName, roomId, socket.id, accountId);

        currentUsers.push(newUser); //could have also used newUser.sessionId as the key.

        let usersInRoom = getRoomUsers(newUser.roomId);

        socket.join(newUser.roomId);
        io.to(newUser.roomId).emit('roomList', usersInRoom);
        console.log(roomName);
        io.to(newUser.sessionId).emit('displayRoom', roomId, roomName);
    });



    socket.emit('message', 'Welcome to Slime share!');

    //Broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat'); //everyone but the client

    //run when client disconnected
    socket.on('disconnect', () => {
        console.log("User disconnected");
        // console.log(currentUsers);
        const user = getUser(socket.id);
        // console.log(currentUsers);
        removeUser(user.sessionId);
        let usersInRoom = getRoomUsers(user.roomId);
        io.to(user.roomId).emit('roomList', usersInRoom);
        io.emit('message', 'A user has left the chat');
     });

    //Listen for chat message
    socket.on('chatMessage', (msg) =>{
        
        io.emit('message', msg);
    });



});

//Function to return an array of the users in a certain room.
//This may not work because currentUsers might not be an array? I just noticed that.
function getRoomUsers(room) {
    return currentUsers.filter(user => user.roomId === room);
}

function addRoom(id, name) {
    return {id, name};
}

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
    console.log(currentUsers[index]);
    currentUsers.splice(index,1);  //Remove the user from that index.
}

//This function should filter out users that match the room ID that is passed in, and return an array of those users.
function filterUser(roomId) {
    let userList = [];
    return userList.filter(user => user.roomId === roomId);
}

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));