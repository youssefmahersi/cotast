exports.authTeacher = (req,res,next)=>{
    if(req.user.status === "Teacher"){
        return res.redirect("/thome");
    }
    next();
}

exports.authStudent = (req,res,next)=>{
    if(req.user.status === "Student"){
        return res.redirect("/shome");
    }
    next();
}