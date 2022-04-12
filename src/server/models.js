const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
    id: String,
    name: String,
    downloads: Number,
    data: String, //store as base64
})

var UserSchema = new Schema({
    name: String,
    password: String,
    id: String,
    publicFiles: [String], //ids of file schemas
    files: [FileSchema],
    
})

let File = mongoose.model('File', FileSchema);
let User = mongoose.model('User', UserSchema);

module.exports = {User, File};

