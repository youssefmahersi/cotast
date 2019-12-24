const mongoose = require("mongoose");
const schema = mongoose.Schema;
const followerSchema = new schema({
    followid : {
        type : mongoose.Types.ObjectId,
        required :true,
        ref : "User"
    },
    followusername : {
        type : String,
        required :true
    },
    followers :[
        {
            username : {
                type : String,
                required :true
            },
            followerid : {
                type : mongoose.Types.ObjectId,
                required : true,
                ref : "User"
            },
            school : {
                type : String,
                required :true
            },
            email :{
                type : String,
                required :true
            },
            subscribe :{
                type : String,
                required :true
            },
            time :{
                type : String,
                required :true
            }

        }
    ]
});

module.exports = mongoose.model("Follower",followerSchema);