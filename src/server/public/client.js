const { format } = require("path");

const socket = io();

// For when a user wants to download a file
// NOTE: Parameters can be added ina whenever we need to
socket.on('download', () => {
    console.log("Clientside to download");

    //Code for downloading goes here
});


// For when a user wants to upload a file
// NOTE: Parameters can be added in whenever we need to
socket.on('upload', () => {
    console.log("Clientside to upload");

    //Code for uploading goes here
})


socket.on('initializationMessage', () => {
    console.log("This is the clienside initialization message");
})

socket.on('roomCreateSucess', roomId => {
    console.log("Room was created with id" + roomId);
}) 


// For when a user has joined the session RIGHT after they log in.
form.addEventListener('joinSession', (e) => {
    e.preventDefault();
    const input_name = e.target.elements.input.value;
    input_name.trim();

    socket.emit('join session');

    e.target.elements.input.value=''; //Probably not needed but just in case.
})

//This function was for when a user wants to join a room, it just sends a request to the server seeing if a room is available.
//This function was built assuming that the room id is input through a text field
const joinForm = document.getElementById('joinForm');

joinForm.addEventListener('submit', (e) => {
    
    e.preventDefault();
    const usernameInput = joinForm.elements['sessionName'];
    const sessionId = joinForm.elements['sessionId'];

    const username = usernameInput.value;
    const roomId = sessionId.value;

    username.trim();
    roomId.trim();

    //Send request to server
    socket.emit('joinRoom', sessionId, 1, username);    //Not sure how to send second param, being accountId.

    e.target.elements.input.value='';  //Probably not needed but just in case.
});

//This function is for when a user wants to create a room, it sends a request to the server to create a room.
//This function was built assuming that the room name is input through a text field
form.addEventListener('createRoom', (e) => {
    e.preventDefault();
    const roomName = e.target.elements.input.value;
    roomName.trim();

    //Send request to server
    socket.emit('createRoom', roomName);
    e.target.elements.input.value=''; //Probably not needed but just in case.

})



