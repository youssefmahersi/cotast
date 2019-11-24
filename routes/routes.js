const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth");
const tController = require("../controllers/teacher");
const sController = require("../controllers/student");
const roomController = require("../controllers/room");
const auth = require("../util/auth-route");
const loggedin = require("../util/loggedin");
const auths = require("../util/auth");
const User = require("../models/user");
const Room = require("../models/room");
const { body,check } = require("express-validator/check");
router.get("/",loggedin,controller.getIndex);

////auth
router.post("/signup",[
    body("username","Nom d'utilisateur invalide").trim().not().isEmpty().withMessage("Nom d'utilisateur vide").isLength({min : 4 }).withMessage("le nom d'utilisateur doit être au moins avec 4 caractères").custom((value , { req })=>{
        return User.findOne({ username : value})
        .then(userDoc=>{
            if(userDoc){
                throw new Error("Le nom d'utilisateur existe déjà");
            }
            return true;
        })
    }),
    
    check("email","email invalide").not().isEmpty().withMessage("E-mail vide").isEmail().custom((value , { req })=>{
        return User.findOne({email : value})
        .then( userDoc =>{
            if(userDoc){
                throw new Error("L'email existe déjà");
            }
            return true ;
            
        });
        
    }),
    body("school","Lycée invalide").not().isEmpty().withMessage("Vide Lycée"),
    body("status","Statut invalide").not().isEmpty().withMessage("Vide Statut"),
    body("password","Mot de passe incorrect").not().isEmpty().withMessage("Mot de passe vide").isLength({ min: 5 }).withMessage("le mot de passe doit être au moins de 5 caractères").isAlphanumeric().trim(),
    body("passwordconfirm").custom((value,{ req })=>{
        if(value !== req.body.password){
            throw new Error("Les mots de passe doivent correspondre!");
        }
        return true;
    })
    
],controller.postSignup);

router.post("/login",[
    body('email')
    .not()
    .isEmpty()
    .withMessage("E-mail vide")
      .isEmail()
      .withMessage('mettez une adresse email valide.')
      .normalizeEmail(),
    body('password', 'Le mot de passe doit être valide.')
    .not()
    .isEmpty()
    .withMessage("Mot de passe vide")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
],controller.postLogin);




/////teacher

router.get('/thome',auths ,auth.authStudent, tController.getTHome);

router.get("/tchat",auths,auth.authStudent,tController.getChat);
router.get("/tprofil",auths,auth.authStudent,tController.getProfil);
router.post("/upload",auths,auth.authStudent,[
    body("description","invalide commentaire").not().isEmpty().isLength({min:3}).withMessage("bref commentaire").isString()
    .trim()
],tController.postUplaod);
router.post("/edit-user",auths,auth.authStudent,[body("username","Nom d'utilisateur invalide").trim().not().isEmpty().withMessage("Nom d'utilisateur vide").isLength({min : 4 }).withMessage("le nom d'utilisateur doit être au moins avec 4 caractères"),


body("school","lycéé invalide").not().isEmpty().withMessage("Lycée vide")


],tController.editUser);
router.delete("/delete-product/:postId",auths,auth.authStudent,tController.deletePost);
router.post("/create-room",auths,auth.authStudent,[body("roomName","nom de groupe invalide").isLength({min : 4 }).withMessage("le nom du groupe doit être au moins de 4 caractères").custom((value,{ req })=>{
    return Room.findOne({roomname : value, "creator._id": req.user._id}).then(result=>{
        if(result){
            throw new Error("nom du groupe existe");
        }
        return true;
    })
}).trim(),body("roomPassword","mot de passe de groupe invalide").not().isEmpty().isLength({min : 4 }).withMessage("mot de passe de la chambre doit être au moins de 4 caractères")],tController.createRoom)
router.post("/logoutt",auths,auth.authStudent,tController.logout);


/////student
router.get("/shome",auths,auth.authTeacher,sController.getSHome);
router.get("/schat",auths,auth.authTeacher,sController.getChat);
router.get("/sprofil",auths,auth.authTeacher,sController.getProfil);
router.post("/create-folder",auths,auth.authTeacher,[body("foldername","Nom de dossier invalide").trim().not().isEmpty().withMessage("Nom du dossier vide").isLength({min : 3 }).withMessage("le nom du dossier doit être au moins de 3 caractères")],sController.postFolder);
router.post("/add-content",auths,auth.authTeacher,sController.addContent);
router.post("/edit-student",auths,auth.authTeacher,[body("username","Nom d'utilisateur invalide").trim().not().isEmpty().withMessage("Nom d'utilisateur vide").isLength({min : 4 }).withMessage("nom d'utilisateur doit être au moins avec 4 caractères"),
body("school","École invalide").not().isEmpty().withMessage("École vide")


],sController.editUser);
router.get("/profil/:teacherid",auths,auth.authTeacher,sController.getteacherProfil);
router.post("/find-teacher",auths,auth.authTeacher,sController.findTeacher);
router.post("/follow-teacher",auths,auth.authTeacher,sController.followTeacher);
router.post("/logouts",auths,auth.authTeacher,sController.logout);
router.post("/sjoinroom",auths,auth.authTeacher,[body("roomname","Nom de groupe invalide").not().isEmpty().withMessage("Nom du groupe vide").trim().isString(),body("roompassword","Mot de passe de groupe invalide").not().isEmpty().withMessage("Mot de passe de groupe vide").trim().isString()],sController.joinromm);
//room
router.get("/room/:roomId",auths,roomController.getRoom);


module.exports = router;


