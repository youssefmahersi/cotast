const Post = require("../models/post");
const { validationResult } = require('express-validator/check');
const Folder = require("../models/folder");
const User = require("../models/user"); 
const Follower = require("../models/follower");
const Room = require("../models/room");
exports.getSHome = (req,res,next)=>{
    
    let message = req.flash('shome');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
    Post.find({"creator.school":req.user.school}).sort({ 'createdAt' : -1 }).then(posts=>{
        Folder.find({creatorId : req.user._id}).then(folders=>{
            
                res.render("student/shome",
                {
                    title : "Home",
                    path : "home",
                    posts : posts,
                    folders : folders,
                    message : message
                    
                });
        })
    
    }).catch(err=>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
    
}
exports.getChat = (req,res,next)=>{
    Room.find().then(rooms =>{
        let rooma = [];
        for(let i =0;i<rooms.length; i++){
           
            var check = rooms[i].usersId.filter(userId=> userId.toString() === req.user._id.toString());
            
            if(check.length > 0){
                rooma.push({roomname:rooms[i].roomname,
                id: rooms[i]._id});
            }
        }
        
        res.render("student/schat",{
            title : "Chat",
            path : "chat",
            rooms : rooma
        })
        
    }).catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
    
}
exports.getteacherProfil = (req,res,next)=>{
    const teacherId = req.params.teacherid;
    User.findOne({_id : teacherId}).then(teacher=>{
        Post.find({"creator._id" : teacher._id}).countDocuments().then(numDocuments=>{
           
            
            Post.find({"creator._id" : teacher._id}).sort({ 'createdAt' : -1 }).then(posts =>{
                Folder.find({creatorId : req.user._id}).then(folders =>{
                    Follower.findOne({followid : teacherId}).then(followers=>{
                        return res.status(200).render("student/ssearch",{
                            title : teacher.username,
                            path: "ssearch",
                            teacher : teacher,
                            numposts : numDocuments,
                            posts : posts,
                            folders : folders,
                            followers : followers.followers.length 
                        
                        })

                    })
                  
                })
                

           })
           
       })

    }).catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })

};
exports.getProfil = (req,res,next)=>{
    let editMode = "false" ;
    const edit = req.query.edit;
    if(edit === "true"){
        editMode= "true";
    }
    
    
    Folder.find({creatorId : req.user._id}).then(folders =>{
      
        let message2 = req.flash('edit');
        if (message2.length > 0) {
            message2 = message2[0];
        } else {
            message2 = null;
        }
        let message = req.flash('sprofil');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render("student/sprofil",{
            title : "Profil",
            path : "profil",
            message : message,
            message2: message2,
            folders :folders,
            username : req.user.username,
            email: req.user.email,
            school : req.user.school,
            editMode : editMode
            

    })

    }).catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      
    })
    
}
exports.postFolder = (req,res,next)=>{
    const foldername = req.body.foldername;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        req.flash("sprofil",errors.array()[0].msg);
        return res.redirect("/sprofil");
    }
    Folder.findOne({foldername : foldername , creatorId : req.user._id}).then(result=>{
        if(result){
            req.flash("sprofil","nom de dossier existe");
            return res.redirect("/sprofil");
        }
        
        const folder = new Folder({
            foldername : foldername,
            contents : [],
            creatorId : req.user._id
        });
        return folder.save().then(resu =>{
            return res.redirect("/sprofil");
          });
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}
exports.addContent = (req,res,next)=>{
    const filename = req.body.filename;
    const foldername = req.body.foldername;
    Folder.findOne({foldername : foldername,creatorId : req.user._id}).then(folder =>{
        if(folder){
            var check = folder.contents.find(element => element === filename);
            if(check){
                return res.json({message : "Le contenu existe déjà"});
            }
            else{
                folder.contents.push(filename);
            return folder.save().then(result=>{
                res.status(300).json({message : "le contenu a été ajouté"});
            });

            }
            
        }
        
    })
    
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.editUser = (req,res,next)=>{
    const username = req.body.username;
    
    const school = req.body.school;
   
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        req.flash('edit', errors.array()[0].msg);
        return res.redirect("/sprofil?edit=true");
    }
    if(username !== req.user.username){
        User.findOne({username : username}).then(result=>{
            if(result){
                req.flash('edit', "nom d'utilisateur alerady existe");
                return res.redirect("/sprofil?edit=true");
            }
        });
    }
    if(username !== req.user.username || school !== req.user.school){
       
        User.findById(req.user._id).then(user =>{
        if(!user){
            
            return res.redirect("/");
        }
        user.username = username;
        user.school = school;
        return user.save();
        }).then(result =>{
                
                return res.status(200).redirect("/sprofil");
            
    }).catch(err =>{
        const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
// } 
}
        else{
        req.flash('edit', "pas de changement");
        return res.redirect("/sprofil?edit=true");
    }
}
exports.findTeacher = (req,res,next)=>{
    const teachername = req.body.teachername.toLowerCase();
    
    if(teachername === req.user.username){
        return res.redirect("/sprofil");
    }
    User.findOne({username : teachername , school : req.user.school}).then(teacher =>{
        
        if(!teacher){
            req.flash("shome"," aucun enseignant avec ce nom d'utilisateur dans votre lycée");
            return res.redirect("/shome");

        }
        
       
        Post.find({"creator._id" : teacher._id}).countDocuments().then(numDocuments=>{
           
            
             Post.find({"creator._id" : teacher._id}).sort({ 'createdAt' : -1 }).then(posts =>{
                 Folder.find({creatorId : req.user._id}).then(folders =>{
                    Follower.findOne({followid : teacher._id}).then(followers=>{
                        if(followers){
                            return res.status(200).render("student/ssearch",{
                        
                                title : teacher.username,
                                path: "ssearch",
                                teacher : teacher,
                                numposts : numDocuments,
                                posts : posts,
                                folders : folders,
                                followers : followers.followers.length
                            
                            })
                        }
                        return res.status(200).render("student/ssearch",{
                        
                            title : teacher.username,
                            path: "ssearch",
                            teacher : teacher,
                            numposts : numDocuments,
                            posts : posts,
                            folders : folders,
                            followers : 0
                        
                        })

                   
                 })
                })
                 

            })
            
        })
    }).catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.followTeacher = (req,res,next)=>{
    const teacherId = req.body.teacherid;
    
    Follower.findOne({followid : teacherId})
    .then(follower =>{
        if(follower){
            
            var check = follower.followers.find(izd =>  izd.followerid.toString() === req.user._id.toString());
            if(check){
                
                return res.json({message : "vous etes un abonné" });
            }
            const user = {
                username : req.user.username,
                followerid : req.user._id,
                school : req.user.school,
                email : req.user.email
            }
            follower.followers.push(user);
            return follower.save().then(result =>{
                
                res.json({message : "vous etes un abonné"});
            });
        }else{
            const newfollower = new Follower({
                followid : teacherId,
                followers :[{
                    username : req.user.username,
                    followerid : req.user._id,
                    school : req.user.school,
                    email : req.user.email
                }]
            });
            return newfollower.save().then(result =>{
                
                res.json({message : "vous avez abonné"});
            });
        }
    })
    .catch(err=>{
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

exports.joinromm = (req,res,next)=>{
    const roomname = req.body.roomname;
    const password = req.body.rommpassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(200).json({message : errors.array()[0].msg});
    }
    Room.findOne({roomname : roomname ,rommpassword: password}).then(room =>{
        
        if(!room){
            
            return res.status(200).json({message : "Pas ge groupes"});
        }
        const check = room.usersId.filter(userId => userId.toString() === req.user._id.toString());
        
            if(check.length > 0){
                return res.status(200).json({message : "vous etes un abonné!"});
            }
            room.usersId.push(req.user._id);
            return room.save().then(result =>{
                res.status(200).json({message : "Success!!"});
            });
        
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}