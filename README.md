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

You will be redirected to the main screen, where there will be a button to join a room.
