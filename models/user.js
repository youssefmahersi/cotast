const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema =  new Schema({
    username : {
        type :String,
        required : true
    },
    email : {
        type :String,
        required : true
    },
    school : {
        type :String,
        required : true
    },
    password : {
        type :String,
        required : true
    },
    status : {
        type :String,
        required : true
    },
    isVerified: { 
        type: Boolean, 
        default: false ,
        required:true
    }
});


module.exports = mongoose.model("User",userSchema);