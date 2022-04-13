# Slime-Share
Project for CPSC 513

To run the code, there a few requirements.

1. In the src/server directory, make sure to run npm i to install all dependencies.
2. Make sure to have mongodb installed. Make sure mongod.exe and mongo.exe is running on separate terminals on your device.

There may be some issues upon running. 
1. If this error appears: throw new MongooseError('The `uri` parameter to `openUri()` must be a ' +
          ^MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.

          create a .env file in the src/server directory, and copy/paste this command inside:
          MONGOOSE_ADDR="mongodb://localhost:27017"
          SESSION_KEY="hyjwwcB4wM2baNIO7Die"

2. If this error appears: "Cannot find module 'express'" or any similar issue, delete the node_modules folder, and run "npm i" in the terminal after the node_modules folder is deleted.


After running, successfully, the terminal should say "Server listening on port 3000"

Go to your browser of choice and go to http://localhost:3000/.

You will be redirected to the main screen, where there will be a button to join/create a room. Click it to be redirected to the next page.

This page will have the join/create button, a view files button, and fields for your desired username and the room id that you wish to join.
1. If you wish to create a room, simply input your username and proceed with the join/create room button. The program will recognize if the room id does not exist. If it does not exist, it will create a room automaticall for you, with a randomly generated ID.
2. If you wish to join an existing room, input your username and the room id that you wish to join. This must be an existing room created by another user, to which the id will be listed in the left sidebar.


Once in a session's room
1. To send a message, simply input your text at the bottom and click the send key or hit the enter key.
2. To upload a file, click the "browse" button. Select a file and it will be put in the buffer. Click the "Upload a file" to send the file into the chat box.
3. To download a file, click on the file in the chatbox. Your device will download the file based on the device settings. 
4. To leave the chatroom, simply click the "leave room" button.

NOTES: There are some notes regarding files.
1. files should be relatively small.
2. files should not have suffixes. e.g. test_file.txt. This is an issue with the type of reader we have implemented.
3. For testing file upload and download, create a blank txt file and remove the ".txt" extension. Uploading this and downloading this will have the best chance of functioning properly.
 
