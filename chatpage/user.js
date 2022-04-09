//stores user session data
 
class User {
    constructor(name, roomId, sessionId, accountId){
        this.name = name; //username
        this.roomId = roomId //ID of the room.
        this.sessionId = sessionId; //socket id
        this.accountId = accountId; //should be null if user is not registered.
        this.root = this.setPriviledge();
        this.files = []; //if the user has an account, this should be the files they wish to save for the session.
    }

    setPriviledge () {
        return true;
        //should check if the user created the session and return true if so. 
    }

}

module.exports = User;