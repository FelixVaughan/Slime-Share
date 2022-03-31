const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
let {generateUniqueString} =  require('./utils');
let {User, File} = require('./models');
const serverPort = process.argv[2] || 3000;
const dotenv = require('dotenv');
dotenv.config();
const mongooseAddr = process.env.MONGOOSE_ADDR;

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

(async () => {
    await mongoose.connect(mongooseAddr,{
        useNewUrlParser: true, useUnifiedTopology: true
    })
})();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log(`Server connected DB establised on ${mongooseAddr}`);
});


let QueryUser = async (queryObject) => {
    return await User.findOne(queryObject, (err, user) => {
        if(err) {
            console.log(err);
            return 'err'
        };
        return user;
    }).clone().catch((err) => console.log(err));
}

app.post('/signUp', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let userData = await QueryUser({name: username});
    if(userData === 'err') res.status(404).send('404. Could not Create a User Account, Perhaps With Different Credentials');
    if(!userData){ //if no user is returned and an error is not thrown it means that the user does not exist so we can create the user.
        let randomHash = generateUniqueString([]) + generateUniqueString([]); //called twice to create a 2n sized string
        const newUser = new User({name: username, password: password, id: randomHash, files: [], publicFiles: []});
        await newUser.save();
        res.status(200).send('Registered User')
    }
    else {
        res.status(400).send('User Already Exists')  
    }
})

app.get('/signUp', async (req, res) => {
    res.sendFile('sign-up.html', { root: path.join(__dirname, 'public') });
})


app.get('/signIn', (req, res) => {
    res.sendFile('sign-in.html', { root: path.join(__dirname, 'public') });
})

app.get('joinSession', (req, res) => {
    res.sendFile('room-selection.html', { root: path.join(__dirname, 'public') });
})

app.post('/signIn', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let userData = await QueryUser({name: username, password: password});
    if(userData){ //if no user is found, then null is returned, which is = false. 
        res.status(200).json(userData) //sendFile('../client/user-homepage.html');
    }
    else{
        res.status(400).json({}) //send('404. Could not Verify User');
    }
})

app.listen(serverPort, () => console.log(`Server listening on port ${serverPort}`))