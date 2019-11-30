const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomSchema = new Schema({
    roomname : {
        type : String,
        required : true
    },
    roompassword:{
        type : String,
        required : true
    },
    usersId : {
        type : Array,
        required : true
    },
    messages :[{
        username : {
            type : String,
            required : true
        },
        message : {
            type :String,
            required : true
        },
        status: {
            type :String,
            required : true
        },
        messagetime : {
            type : String,
            required : true
        }
    }],
    creator : {
        type : Object,
        required : true
    }

});

module.exports = mongoose.model("Room", roomSchema);