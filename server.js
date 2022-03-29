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
let active_rooms = []; //Array to hold IDs of all active rooms
let current_users = []; //Array to display all current users
let room_id = 0;    //Int that will increase when a room is created, it'll never be decremented.

io.on('connection', socket => {
    //Console log for when a user connects
    console.log("New connection!");

    
    
    // For when a user disconnects
    socket.on('disconnect', () => {
        console.log("User disconnected");
        const user = getUser(socket.id);
        removeUser(user.id);
    });
    
    //For when the user wants to join a room. Need the room id they want to join and the username.
    socket.on('join', (room_id, username) => {
        let userJoin = false;
        console.log("Server processing room join");
        //If room id exists then join, done by looping through rooms and checking id
        for (let x in active_rooms) {
            if (x.id == room_id) {
                userJoin = true;
                break;
            }
        }
        
        if (userJoin == true) {
            user = addUser(socket.id, username, room_id);   //We'll create a user object, using addUser.
            socket.join(user.room);   //Join the socket to a specific room using the room attribute for the user.
        } else {
            //Error message will be a prompt to the user.
            console.log("Could not join room. Check ID");
        }

    });

    //NOTE: Lines 63-65 and Lines 80-82 might not work as intended, but it's purpose is to try to join the user to the room after they create it.
    socket.on('createRoom', room_name => {
        const user = getUser(socket.id);

        let cancel = false; //Variable to signify whether to cancel room creation.
        console.log("Server processing room creation");
        //Do checks here e.g. if name is valid
        room_name.trim();   //Trim the room name
        if (active_rooms.length == 0) { //If the array is empty, go ahead and create a room.
            const room = addRoom(room_name); //Function to add a room
            user.room = room.room_id;   //Set the user's room to the room's id.
            socket.join(user.room); //Jointhe socket onto that user's room.

        } else {
            //For the code below, not sure if we can have rooms with the same name. If we can, we can just refactor the code to create a room wihtout that restriction.
            for (let i in active_rooms) {   //Loop through rooms to see if name is already taken.
                if (active_rooms[i].name == room_name) {
                    console.log("Room name already taken!");
                    cancel = true;  //Set cancel to true
                    break;  //Break out of the loop
                }
            }

            if (cancel == true) {   //If cancel is true, then send error msg.
                console.log("Error creating room.");
            } else {    //Else, create a room.
                const room = addRoom(room_name); //Function to add a room
                user.room = room.room_id;   //Set the user's room to the room's id.
                socket.join(user.room); //Jointhe socket onto that user's room.
            }
        }
    });

    //
    socket.on('destroy room', rid => {
        destroyRoom(rid);
        console.log("Room Session Terminated.");
    }); 

});

//Function to add a room to the active_room array.
function addRoom(name) {
    const room = {room_id, name}    //Create room object
    active_rooms.push(room);    //Push the object onto the array.
    room_id = room_id+1;    //Increment the room id.
    return room;    //Return room object.
}

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

//Function to return a user based on the socket id.
function getUser(uid) {
    for (let i in current_users) {
        if (current_users[i].id = uid) {
            return current_users[i];
        }
    }
}

//Function to add a user to the current_users array.
//NOTE: We can change whatever attributes the user has at any time.
function addUser(uid, username, room) {
    const user = {uid, username, room}  //Create a userobject
    current_users.push(user);   //Add user to the current users array.
    return user;    //Return the user object
}

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