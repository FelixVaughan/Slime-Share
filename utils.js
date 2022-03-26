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



module.exports = {generateUniqueString}