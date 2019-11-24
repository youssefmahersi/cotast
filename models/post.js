const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const psotSchema = new Schema({
    filename : {
        type : String,
        required : true
    },
    comment : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    createdAt : {
        type : String,
        required : true
    },
    creator : {
        type : Object,
        required : true,
        ref : "User"
    }
});

module.exports = mongoose.model("Post" , psotSchema);