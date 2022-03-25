const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userScehma = new Schema({
    name: String,
    password: String,
    id: String,
    publicFiles: [String], //ids of file schemas
    files: [fileSchema],
})

var fileSchema = new Schema({
    id: String,
    owner: String,
    downloads: Number,
    data: [String], //store as base64
})

module.exports = {userScehma, fileSchema};