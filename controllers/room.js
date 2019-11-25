const Room = require("../models/room");
const Cryptr = require('cryptr');
const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);
exports.getRoom = (req,res,next)=>{
    Room.findOne({_id : req.params.roomId}).then(room=>{
        room.messages.forEach(element => {
            element.message =cryptr.decrypt(element.message)
        });
        
        let check = room.usersId.filter(userid => userid.toString() === req.user._id.toString());
        
        if(room.creator._id.toString() === req.user._id.toString()){
            return res.render("room",{
                title : room.roomname,
                path : room.roomname,
                rooms : room,
                status : "teacher",
                roomId : req.params.roomId,
                username : req.user.username,
                envVariable :process.env.DOMAIN_NAME
            })
            
        }else if(check.length >0){
            return res.render("room",{
                title : room.roomname,
                path : room.roomname,
                rooms : room,
                status : "student",
                roomId : req.params.roomId,
                username : req.user.username,
                envVariable :process.env.DOMAIN_NAME
            })
        }else{
            return res.redirect("/");
        }
        

    }).catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
    
  }