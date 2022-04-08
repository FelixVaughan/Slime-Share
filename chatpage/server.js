const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// set static folder
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/chatpage', (req, res) => {
    res.sendFile('userchatpage.html', { root: path.join(__dirname, 'public') });
});


//runs when client connects
io.on('connection', socket =>{
    socket.emit('message', 'Welcome to Slime share!');

    //Broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat'); //everyone but the client

    //run when client disconnected
    socket.on('disconnect', () =>{
        io.emit('message', 'A user has left the chat');
     });

    //Listen for chat message
    socket.on('chatMessage', (msg) =>{
        
        io.emit('message', msg);
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));