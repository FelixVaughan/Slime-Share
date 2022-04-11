const express = require('express');
const socket = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socket(server);
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

console.log(`key is ${process.env.SESSION_KEY}`)
const session = require("express-session")({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60 * 1000 * 60 //1 hour
    }
});
const sharedSession = require('express-socket.io-session');
const cors = require('cors')
let rooms = [{
    id: "1",
    name: "room1"
}]; //Array to hold IDs of all active rooms
let currentUsers = []; //Array to display all current users
let ids = 2;

io.use(sharedSession(session, {
    autoSave:true
})); 

let {
    generateUniqueString
} = require('./utils');
let {
    User,
    File
} = require('./models');
let SessionedUser = require('./user');

const serverPort = process.argv[2] || 3000;
const mongooseAddr = process.env.MONGOOSE_ADDR;

app.use(cors({
    origin: 'http://localhost:3000', //Your Client, do not write '*'
    credentials: true,
}))


app.use(session)


app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.set('trust proxy', true);

(async () => {
    await mongoose.connect(mongooseAddr, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log(`Server connected DB establised on ${mongooseAddr}`);
});


let QueryUser = async (queryObject) => {
    return await User.findOne(queryObject, (err, user) => {
        if (err) {
            console.log(err);
            return 'err'
        };
        return user;
    }).clone().catch((err) => console.log(err));
}

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, 'public')
    });
})

app.get('/joinRoom', (req, res) => {
    res.sendFile('joinRoom.html', {
        root: path.join(__dirname, 'public')
    })
})

app.get('/userChatPage', (req, res) => {
    res.sendFile('userchatpage.html', {
        root: path.join(__dirname, 'public')
    })
})

app.post('/signUp', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(password)
    let userData = await QueryUser({
        name: username
    });
    if (userData === 'err') res.status(404).send('404. Could not Create a User Account, Perhaps With Different Credentials');
    if (!userData) { //if no user is returned and an error is not thrown it means that the user does not exist so we can create the user.
        let randomHash = generateUniqueString([]) + generateUniqueString([]); //called twice to create a 2n sized string
        const newUser = new User({
            name: username,
            password: password,
            id: randomHash,
            files: [],
            publicFiles: []
        });
        await newUser.save();
        res.status(200).send('Registered User')
    } else {
        res.status(400).send('User Already Exists')
    }
})

app.get('/userHomepage', (req, res) => {
    console.log(req.session)
    if (req.session.loggedIn) {
        console.log('user logged in')
        res.sendFile('user-homepage.html', {
            root: path.join(__dirname, 'public')
        });
    } else res.status(400).send('Unauthorized');
})

app.get('/signUp', async (req, res) => {
    res.sendFile('sign-up.html', {
        root: path.join(__dirname, 'public')
    });
})


app.get('/signIn', (req, res) => {
    res.sendFile('sign-in.html', {
        root: path.join(__dirname, 'public')
    });
})

app.get('/joinSession', (req, res) => {
    res.sendFile('room-selection.html', {
        root: path.join(__dirname, 'public')
    });
})

app.post('/joinsession', (req, res) => {
    sessionName = req.body.sessionName;
    sessionId = req.body.sessionId;
    //check to make sure session id is valid and session name is not taken within room.
    console.log(`session name: ${sessionName}\nsession ID: ${sessionId}`);
    res.status(200).send('room joined') //not actually yet 

})

app.post('/signIn', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let userData = await QueryUser({
        name: username,
        password: password
    });
    if (userData) { //if no user is found, then null is returned, which is = false.
        req.session.loggedIn = true;
        req.session.userData = userData;
        req.session.save();
        res.status(200).send(userData);
    } else {
        res.status(400).json({});
    }
})



io.on('connection', socket => {

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

        if (roomExist) {
            console.log("WOOOO!");
            let newUser = new SessionedUser(userName, roomId, socket.id, accountId);

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

    socket.on('img-file', (img, filename) => {
        console.log(img);
        io.emit('message', img, filename);
    })

    socket.on('createRoom', (roomName, userName, accountId) => {
        //let roomNames = Object.values(rooms).map(elem => elem[0]);
        //let roomId = generateUniqueString(Object.keys(rooms));
        let roomId = ids.toString();
        ids = ids + 1;

        console.log(rooms);

        let newRoom = addRoom(roomId, roomName);
        rooms.push(newRoom);

        console.log(rooms);

        const newUser = new SessionedUser(userName, roomId, socket.id, accountId);

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
    socket.on('chatMessage', (msg) => {

        io.emit('message', msg);
    });



});

//Function to return an array of the users in a certain room.
//This may not work because currentUsers might not be an array? I just noticed that.
function getRoomUsers(room) {
    return currentUsers.filter(user => user.roomId === room);
}

function addRoom(id, name) {
    return {
        id,
        name
    };
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
    let index; //Temporary variable to keep track of index
    for (let i in currentUsers) { //Loop through the list of current users
        if (currentUsers[i].sessionId == id) { //Find the id of the user to remove
            index = i; //Set index to i
            break;
        }
    }
    console.log(currentUsers[index]);
    currentUsers.splice(index, 1); //Remove the user from that index.
}

//This function should filter out users that match the room ID that is passed in, and return an array of those users.
function filterUser(roomId) {
    let userList = [];
    return userList.filter(user => user.roomId === roomId);
}


server.listen(serverPort, () => console.log(`Server listening on port ${serverPort}`))