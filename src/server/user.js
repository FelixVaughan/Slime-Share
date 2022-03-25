//stores user session data
 
class User {
    constructor(name,sessionId, accountId){
        this.name = name;
        this.root = this.setPriviledge();
        this.sessionId = sessionId;
        this.accountId = accountId; //should be null if user is not registered.
        this.files = []; //if the user has an account, this should be the files they wish to save for the session.
    }

    setPriviledge () {
        return true;
        //should check if the user created the session and return true if so. 
    }

}

module.exports = user;