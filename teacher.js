const Post = require("../models/post");
const { validationResult } = require('express-validator/check');
const User = require("../models/user"); 
const moment  = require('moment');
const fileHelper = require("../util/file");
const Follower = require("../models/follower");
const bcrypt = require("bcrypt");
const Room = require("../models/room");
const nodemailer = require('nodemailer');
const sendgridTransport = require("nodemailer-sendgrid-transport");
const fs = require("fs");
// const sendgrid = require("@sendgrid/mail");
// sendgrid.setApiKey("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");
var transporter = nodemailer.createTransport(sendgridTransport({
    
  service: 'gmail',
  auth: {
      api_key : process.env.API_KEY
  }

}));
let postsnumber;
exports.getTHome = (req,res,next)=>{
    let message = req.flash('info');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    Post.find({"creator.school": req.user.school}).sort({ 'createdAt' : -1 }).then(posts =>{
      Follower.findOne({followid : req.user._id}).then(followers=>{
        if(followers){

          var followers2 =  followers.followers.filter(follower => follower.subscribe === "abonne");
        }
        Room.find({"creator._id": req.user._id}).then(rooms=>{
          return  res.render("teacher/teacher",
          {
              title : "Home",
              path : "home",
              message : message,
              posts : posts ? posts : [],
              followers : followers2 ? followers2  : [],
              rooms : rooms
          }); 

        })
          
  }) 
    }).catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
        
       
}



exports.getProfil = (req,res,next)=>{
    let editMode = "false" ;
    const edit = req.query.edit;
    if(edit === "true"){
        editMode= "true";
    }
    
    let message = req.flash('tprofil');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    Post.find({"creator._id": req.user._id}).countDocuments().then(countDocuments =>{

        postsnumber = countDocuments;
        return Post.find({"creator._id": req.user._id}).sort({ 'createdAt' : -1 }).then(posts=>{
          Follower.findOne({followid : req.user._id}).then(followers=>{
            Room.find({"creator._id": req.user._id}).then(rooms =>{
              if(!followers){
                return res.render("teacher/tprofil",
                {
                    title : "Profil",
                    path : "profil",
                    posts : posts,
                    numposts : postsnumber,
                    username : req.user.username,
                    email: req.user.email,
                    school : req.user.school,
                    message : message,
                    editMode : editMode,
                    followers :[],
                    enattente : [],
                    numfollow : "0",
                    rooms : rooms ? rooms : []
            
                    
                }); 
              }
              var abonnefollowers = followers.followers.filter(follower => follower.subscribe == "abonne");
              var enattentefollowers = followers.followers.filter(follower => follower.subscribe == "enAttente");
              res.render("teacher/tprofil",
      {
          title : "Profil",
          path : "profil",
          posts : posts,
          numposts : postsnumber,
          username : req.user.username,
          email: req.user.email,
          school : req.user.school,
          message : message,
          editMode : editMode,
          followers :abonnefollowers,
          enattente : enattentefollowers,
          numfollow : abonnefollowers.length,
          rooms : rooms ? rooms : []
  
          
      });  
            });
  })
        })  
    }).catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
    
}

exports.postUplaod = (req,res,next)=>{
    const file = req.file;
    const comment = req.body.description;
    const groupename = req.body.groupename;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash('info', errors.array()[0].msg);
        return res.redirect("/thome");
        // return res.render("teacher/teacher",
        // {
        //     title : "Home",
        //     path : "home",
        //     message : errors.array()[0].msg,
        //     posts : posts2
            
        // });  
        
    }
    if(!file){
        // return res.status(422).render("teacher/teacher",{
        //     title : "Home",
        //     path : "home",
        //     message : "Attached file is not an image or a pdf ",
        //     posts : posts2
        // })
        req.flash('info', "Le fichier n'est pas une image ou un pdf");
        return res.redirect('/thome');
    }
    const filename = file.path;
    const post = new Post({
        filename : filename,
        comment : comment,
        type : file.mimetype,
        createdAt : moment().valueOf(),
        creator : req.user
    });
    post.save().then(result =>{
      res.redirect("/thome");
      if(groupename === "tous"){
        return Follower.findOne({followid : req.user._id ,'followers.subscribe': 'abonne'}).then(followers =>{
          if(followers){
            if(followers.followers.length > 0){
              for(let i= 0;i < followers.followers.length; i++){
                transporter.sendMail({
                  to: followers.followers[i].email,
                  from : "cotast",
                  subject :"Nouvel Publication",
                  html :`<h1 style="text-align:center; font-family:courier,arial,helvetica;">Votre enseignant ${req.user.username} a ajouté une publication </h1><br>
                  <div style="display: inline-block; text-align:center;"><a href="${process.env.DOMAIN_NAME}/profil/${req.user._id}" style="background-color: #f44336;
                  color: white;
                  
                  margin :auto;
                  padding: 14px 25px;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;">Voir profil</a></div>
                  `
                },(err,res)=>{
                  if(err){
                    console.log(err);
                  }
                });
               
              }
            }
  
          }
          
  
        })
      }else{
        return Room.findOne({roomname : groupename , "creator._id":req.user._id}).then(room =>{
          
          if(room){
            if(room.users.length > 0){
              for(let i= 0;i < room.users.length; i++){
                transporter.sendMail({
                  to: room.users[i].email,
                  from : "cotast",
                  subject :"Nouvel Publication",
                  html :`<h1 style="text-align:center; font-family:courier,arial,helvetica;">Votre enseignant ${req.user.username} a ajouté une publication </h1><br>
                  <div style="display: inline-block; text-align:center;"><a href="${process.env.DOMAIN_NAME}/profil/${req.user._id}" style="background-color: #f44336;
                  color: white;
                  
                  margin :auto;
                  padding: 14px 25px;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;">Voir profil</a></div>
                  `
                },(err,res)=>{
                  if(err){
                    console.log(err);
                  }
                });
               
              }
            }
  
          }
        })
       
      }
      
      
    })
    .catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
    
}


exports.editUser = (req,res,next)=>{
    const username = req.body.username;
    
    const school = req.body.school;
   
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        req.flash('tprofil', errors.array()[0].msg);
        return res.redirect("/tprofil?edit=true");
    }
    if(username !== req.user.username){
        User.findOne({username : username}).then(result=>{
            if(result){
                req.flash('tprofil', "Le nom d'utilisateur existe déjà");
                return res.redirect("/tprofil?edit=true");
            }
        });
    }
    // console.log((username !== req.user.username || school !== req.user.school) ? "true": "false");
    if(username !== req.user.username || school !== req.user.school){
        // if(username !== req.user.username){
        //     User.findOne({username : username}).then(result =>{
        //         if(result){
        //             req.flash('tprofil', "Username alerady exists");
        //             return res.redirect("/tprofil?edit=true");
        //         }
        // })
    // }else{
        User.findById(req.user._id).then(user =>{
        if(!user){
            
            return res.redirect("/");
        }
        user.username = username;
        user.school = school;
        return user.save();
        }).then(result =>{
                
                return res.status(200).redirect("/tprofil");
            
    }).catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
// } 
}
        else{
        req.flash('tprofil', "pas de changement");
        return res.redirect("/tprofil?edit=true");
    }
    
}

exports.deletePost = (req,res,next)=>{
    const postId = req.params.postId;
    
  Post.findById(postId)
    .then(post => {
      if (!post) {
        return next(new Error('publication non trouvée.'));
      }
      fileHelper.deleteFile(post.filename);
      return Post.deleteOne({ _id: postId, "creator._id": req.user._id });
    })
    .then(() => {
      Post.find({"creator._id" : req.user._id}).countDocuments().then(postsNum=>{
        
        return res.status(200).json({ message: 'Success!' , posts : postsNum});

      })
      
    })
    .catch(err => {
      res.status(500).json({ message: 'suppression de la publication a échoué.' });
    });
};




exports.createRoom = (req,res,next)=>{
  const roomname = req.body.roomName;
  
  const roompassword = req.body.roomPassword;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.json({message : errors.array()[0].msg});
  }
  bcrypt.hash(roompassword,12).then(hashedPassword =>{
   
    const room = new Room({
      roomname : roomname,
      roompassword : hashedPassword,
      users : [],
      messages : [],
      creator : req.user
    });
    room.save()
  }).then(result =>{
    return res.status(200).json({message : "Room created succesfuly"});
  }).catch(err =>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

}
exports.logout =(req,res,next)=>{
  req.session.destroy(err => {
    console.log(err);
    return res.status(200).json({message:"success"});
  });
}

exports.acceptStudent =  (req,res,next)=>{
  const followerId = req.body.id;
  
  Follower.findOne({followid : req.user._id}).then(data=>{
    
    if(data){
      var find = data.followers.filter(follower => follower._id.toString() === followerId.toString());
      if(find.length > 0 ){
        find[0].subscribe  = "abonne"
        return data.save().then(result=>{
           res.status(200).json({message : "success"});
           
            return transporter.sendMail({
                to: find[0].email,
                from : "cotast",
                subject :"Demande accepter",
                html :`<h1 style="text-align:center; font-family:courier,arial,helvetica;">Votre Enseignant ${req.user.username} a accepté votre demande </h1><br>
                <div style="display: inline-block; text-align:center;"><a href="${process.env.DOMAIN_NAME}/shome" style="background-color: #f44336;
                color: white;
                
                margin :auto;
                padding: 14px 25px;
                text-align: center;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;">Voir profil</a></div>
                `
              },(err,res)=>{
                if(err){
                  console.log(err);
                }
              });
       
          
        });
        
      }
    }
  }).catch(err =>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.rejectStudent =  (req,res,next)=>{
  const followerId = req.body.id;

  Follower.findOne({followid : req.user._id}).then(data=>{
    
    if(data){
      var find = data.followers.filter(follower => follower._id.toString() != followerId.toString());
      
        data.followers = find;
        return data.save().then(result=>{
          return res.status(200).json({message : "success"});
        });
        
      
    }
  }).catch(err =>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}
