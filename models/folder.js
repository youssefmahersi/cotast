const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const folderShgema = new Schema({
    foldername : {
        type :String,
        required : true
    },
    contents : {
        type :Array,
        required : true
    },
    creatorId : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model("Folder",folderShgema);