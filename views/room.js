const Room = require("../models/room");
const Cryptr = require('cryptr');
const cryptr = new Cryptr(`${process.env.CRYPTR_KEY}`);

exports.getRoom = (req,res,next)=>{
    Room.findOne({_id : req.params.roomId}).then(room=>{
        if(!room){
            return res.redirect("/");
        }

        let messages = room.messages;
messages.forEach((el,i) => el.message = "salut");

        let check = room.users.filter(user => user._id.toString() === req.user._id.toString());
        
        if(room.creator._id.toString() === req.user._id.toString() || check.length >0){
            return res.render("room",{
                title :"Cotast",
                path : room.roomname,
                rooms : room,
                status : check.length > 0 ? "student":"teacher",
                roomId : req.params.roomId,
                username : req.user.username,
                envVariable :process.env.DOMAIN_NAME,
                users : room.users,
                teacher : room.creator.username,
                messages : messages
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
