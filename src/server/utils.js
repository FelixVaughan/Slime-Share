const moment = require('moment');

let generateUniqueString = (cannotInclude) => {
    let generateRandomString = () =>  {
        let randomString = '';
        let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < 7; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random()*characters.length));
        }
        return randomString;
    }
    let attempts = 0; 
    while(attempts++ < 10){
        let proposed = generateRandomString();
        if(!cannotInclude.includes(proposed)) return proposed;
    }
    return null;
}

let generateUniqueName = (users) => { 
    adjs = ["amazing", "tired", "annoying", "cynical", "upset", "sophisticated"];
    nouns = ["apartment", "school", "planet", "skyscraper", "bathroom", "country"];
    connectors = ["_"," ","-"];
    let trys = 0;
    while(trys++ <= 35){
        let potentialName = adjs[Math.floor(Math.random() * adjs.length)] + connectors[Math.floor(Math.random() * connectors.length)] + nouns[Math.floor(Math.random()*nouns.length)];
        if(!users.includes(potentialName)){
            return potentialName;
        }
    }
}

function formatMessage(username, text){
    return{
        username,
        text,
        time: moment().format('h:mm a')

    }
}


module.exports = {generateUniqueString, formatMessage, generateUniqueName}