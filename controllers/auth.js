const User = require("../models/user");

const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator/check'); 
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
        return res.status(422).render("index",{
            title : "Cotast",
            path : "home",
            oldInputs :{
                email : email
            },
            validationError : errors.array(),
            message : errors.array()[0].msg
        })
    }
    User.findOne({email : email})
    .then(user =>{
        if(!user){
            return res.status(422).render("index",{
                title : "Cotast",
                path : "home",
                oldInputs :{
                    email : email
                },
                validationError : errors.array(),
                message : "Email ou mot de passe invalide"
            });
        }
        bcrypt.compare(password,user.password)
        .then(doMatch =>{
            if(doMatch){
                req.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err =>{
                    
                    res.redirect('/shome');
                });
            }
            return res.status(422).render("index",{
                title : "Cotast",
                oldInputs :{
                    email : email
                },
                validationError : errors.array(),
                message : "Email ou mot de passe invalide"
            });
        })
    })
    .catch(err =>{
        next(new Error(err));
    })
};