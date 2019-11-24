const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const server = require("http").Server(app);
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPTR_KEY);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const Room = require("./models/room");
const csrf = require("csurf");
const MongoDBStore = require('connect-mongodb-session')(session);
const Mongo_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-hax06.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
const port = process.env.PORT || 3000;
const route = require("./routes/routes");
const User = require("./models/user");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const flash = require("connect-flash");
const moment  = require('moment');
const store = new MongoDBStore({
    uri : Mongo_uri,
    collection : "sessions"
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' || 
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags :"a"});
app.set("view engine","ejs");
app.set("views","views");

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream : accessLogStream}));
app.use(session({
    secret : "my secret",
    resave : false,
    saveUninitialized : false,
    store : store
}));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('file')
);
app.use(csrfProtection);
app.use(flash());
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/profil/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/assets",express.static(path.join(__dirname,"assets")));
app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
  });
  app.use((req,res,next)=>{
    res.locals.csrfToken = req.csrfToken();
    next();
  });
app.use(route);
app.use((req,res,next)=>{
    res.status(404).render("error/404",{
        title : "Page Not Found"
    })
});

// app.use((error, req, res, next) => {
//     // res.status(error.httpStatusCode).render(...);
//     // res.redirect('/500');
//     res.status(500).render('error/500', {
//       title: 'Error!'
//     });
//   });
mongoose.connect(Mongo_uri, {useNewUrlParser: true}).then( result =>{
    console.log("database connected");
   
    server.listen(port,()=>{
        console.log(`server is running on port : ${port}`);
        const io = require("socket.io")(server);
        io.on("connection",(socket)=>{
          
          socket.on('join', (data) => {
           
            socket.join(data.roomId, () => {
              
              socket.to(data.roomId).broadcast.emit('user-connected', data.un)
              socket.on('disconnect',()=>{
                socket.to(data.roomId).broadcast.emit('user-disconnected', data.un)
              })

            });
        
            socket.on('send message', (data) => {
              
              
                Room.findOne({_id : data.roomid}).then(room=>{
                   
                  const msg = {
                    username : data.username,
                    message : cryptr.encrypt(data.message),
                    messagetime : moment().valueOf()
                  }
                  
                  room.messages.push(msg);
                  io.to(data.roomid).emit('new message', {
                    username : msg.username,
                    message : cryptr.decrypt(msg.message),
                    messagetime : msg.messagetime
                  })
                  return room.save();

                })
                
            });
            
            

        });
        })
    });
})
.catch(err =>{
    console.log(err);
    
});


