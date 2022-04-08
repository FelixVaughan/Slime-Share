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

            let usersInRoom = getRoomUsers(newUser.roomId);

            let userNames = Object.entries(currentUsers).map(user => user.name)

            io.to(newUser.roomId).emit('roomList', usersInRoom);
            io.to(newUser.id).emit('displayNames', newUser.roomId);

            // socket.broadcast.to(newUser.roomId).emit(userNames);
            socket.emit('intializationMessage', userNames, files);
            console.log('User has join a room');

        } else {
            console.log("Fail");
        }
        //Else reject
    });

    socket.on('createRoom', roomName, userName, accountId, () => {
        let roomNames = Object.values(rooms).map(elem => elem[0]);
        let roomNum = Object.keys(rooms).length;
        let roomId = generateUniqueString(Object.keys(rooms));

        rooms[roomId] = [roomName, roomNum];

        const newUser = userJoin(userName, roomId, socket.id, accountId);

        currentUsers[socket.id] = newUser; //could have also used newUser.sessionId as the key.
        socket.join(newUser.roomId);

        io.to(newUser.roomId).emit('roomList', usersInRoom);
        io.to(newUser.id).emit('displayNames', newUser.roomId);

        if(roomNames.includes(roomName)){
            socket.join(roomNum);
            socket.emit('roomCreateSuccess', roomId);
            console.log('User has created a room.');
        } else {
            socket.emit('roomCreateFail', null);
            console.log('User has failed to create a room');
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected");
        const user = getUser(socket.id);
        removeUser(user.id);
        let usersInRoom = getRoomUsers(newUser.roomId);
        io.to(newUser.roomId).emit('roomList', usersInRoom);
    });

});

//Function to return an array of the users in a certain room.
//This may not work because currentUsers might not be an array? I just noticed that.
function getRoomUsers(room) {
    return currentUsers.filter(user => user.roomId === room);
}

//Function to add a room to the active_room array.
// function addRoom(name) {
//     const room = {room_id, name}    //Create room object
//     active_rooms.push(room);    //Push the object onto the array.
//     room_id = room_id+1;    //Increment the room id.
//     return room;    //Return room object.
// }

//Function to destroy a room.
function destroyRoom(rid) {
    let index;
    for (let i in active_rooms) {
        if (active_rooms[i].room_id == rid) {
            index = i;
            break;
        }
    }
    active_rooms.splice(index,1);
}

//Function to return a user based on the socket id. (May have to fix this since it's not an array anymore.)
function getUser(uid) {
    for (let i in current_users) {
        if (current_users[i].sessionId = uid) {
            return current_users[i];
        }
    }
}

//Function to add a user to the current_users array.
//NOTE: We can change whatever attributes the user has at any time.
// function addUser(uid, username, room) {
//     const user = {uid, username, room}  //Create a userobject
//     current_users.push(user);   //Add user to the current users array.
//     return user;    //Return the user object
// }

//Function to remove a user from the currentUser array, utilized when a socket/user disconnects.
function removeUser(id) {
    let index;  //Temporary variable to keep track of index
    for (let i in current_users) {  //Loop through the list of current users
        if (current_users.id == id) {   //Find the id of the user to remove
            index = i;  //Set index to i
            break;
        }
    }
    current_users.splice(index,1);  //Remove the user from that index.
}

//This function should filter out users that match the room ID that is passed in, and return an array of those users.
function filterUser(roomId) {
    let userList = [];
    return userList.filter(user => user.roomId === roomId);
}
