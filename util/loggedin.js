module.exports = (req, res, next) => {
    if (req.session.user) {
        
        if(req.session.user.status === "Student"){
            return res.redirect("/shome");
        }
        else if(req.session.user.status === "Teacher"){
            return res.redirect("/thome");
        }
    }
    next();
    
}