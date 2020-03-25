const User = require("../models/user");
const Token = require("../models/token");
const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator/check'); 
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const sendgridTransport = require("nodemailer-sendgrid-transport");
var transporter = nodemailer.createTransport(sendgridTransport({
    
    service: 'gmail',
    auth: {
        api_key : process.env.API_KEY
    }
  
  }));
exports.getIndex = (req,res,next)=>{
    res.render("index",{
        title : "Cotast",
        path : "Home",
        oldInputs : {
            email : ""
        },
        validationError : [],
        message : ""
        

    });
}


exports.postSignup = (req,res,next)=>{
    const username = req.body.username.toLowerCase();
    const email = req.body.email.toLowerCase();
    const school = req.body.school;
    const status = req.body.status;
    const password = req.body.password.toLowerCase();
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        
        return res.status(422).json({message : errors.array()[0].msg});
    } 

    bcrypt.hash(password,12).then(hashedPassword =>{
        
            const user = new User({
                username : username,
                email : email,
                school : school,
                password : hashedPassword,
                status : status
            }); 

            return user.save();

    }).then(resu =>{
        var token = new Token({ _userId: resu._id, token: crypto.randomBytes(16).toString('hex') });
        transporter.sendMail({
            to: resu.email,
            from : "cotast",
            subject :"Account Verification ",
            html :"<h1 style='text-algin : center'>COTAST</h1><h2>Veuillez vérifier votre compte en cliquant sur le lien: \nhttp:\/\/" + req.headers.host + "\/confirmation\/" + token.token + ".\n</h2>"
          },(err,res)=>{
            if(err){
              console.log(err);
            }
          });
        return token.save();

    }).then(resu2 =>{

        res.status(200).json({message:"success"});
    })
    .catch(err =>{
        next(new Error(err));
    })

}

exports.postLogin = (req,res,next)=>{
    const email = req.body.email.toLowerCase();
    const password = req.body.password.toLowerCase();
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({message : errors.array()[0].msg});
    }
    User.findOne({email : email})
    .then(user =>{
        if(!user){
            return res.status(422).json({message :"Email ou mot de passe invalide"});
            
        }
        bcrypt.compare(password,user.password)
        .then(doMatch =>{
            if(doMatch){
                if(!user.isVerified){
                    return res.status(422).json({message :" Compte invalide"});
                }

                req.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err =>{
                    
                    res.status(200).json({message :"success"});
                });
            }
            return res.status(422).json({message :"Email ou mot de passe invalide"});
        })
    })
    .catch(err =>{
        next(new Error(err));
    })
};

exports.confirmationPost =(req, res, next)=>{
    // Check for validation errors
    // Find a matching token
    Token.findOne({token : req.params.token}).then(token =>{
        User.findOne({_id : token._userId}).then(user =>{
            if(!token && !user){
                return res.redirect("/");
                
            }
            if(!user.isVerified){
                user.isVerified = true;
                return user.save();
            }
        }).then(rs =>{
            req.isLoggedIn = true;
            req.session.user = rs;
            return req.session.save(err =>{
                    res.redirect('/shome');
                });
        })
       
    }).catch(err=>{
        next(new Error(err));
    })
   
};