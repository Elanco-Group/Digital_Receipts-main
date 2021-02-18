if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

// Creates express server, listens for connections on port '80'
const express = require("express")
const app = express()
const User = require("./models/user.js");
//const http = require("http").Server(app).listen(80);
const path = require("path");
const port = 3000;

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
)

var result;

app.set ("view engine", "ejs");

app.listen(process.env.PORT || port, () => console.log(`Listening on http://localhost:${port}`));

app.use(require('express-session')({secret:'secret-a',resave:true, saveUninitialized: true}))

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('index.ejs')
})

app.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/userDash',
    failureRedirect: '/',
    
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = new User({
            id: Date.now().toString(),
            title: req.body.title,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            emailAddress: req.body.email,
            password: hashedPassword
        })

        newUser.save(function (error, document){
            if (error) console.error(error);
        })
        
        res.redirect('/')
    } catch {
        res.redirect('/register')
    }
    console.log(User)
})

app.get('/userDash', checkAuthenticated, (req, res) => {
    res.render('userDash.ejs', { name: req.user.firstName })
})

app.post('/userDash', checkAuthenticated,(req, res) => {
    
})

app.get('/addRecs', checkAuthenticated, (req, res) => {
    res.render('addRecs.ejs', { name: req.user.firstName })
})

app.get('/recHistory', checkAuthenticated, (req, res) => {
    res.render('recHistory.ejs', { name: req.user.firstName })
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/userDash')
    }
    next()
}


// require mongodb
const mongoose = require('mongoose')
const url = 'mongodb+srv://ElancoGroupA:iVFPv7X5YGxP2mWN@elancoreceipts.4adsq.mongodb.net/ElancoReceipts?retryWrites=true&w=majority';

// require ejs
const ejs = require('ejs');
const { prototype } = require('events');

// mongoose connection to atlas db ----------------
mongoose.connect(url, { useNewUrlParser:true});

const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})

db.on('error', err => {
  console.error('connection error:', err)
})
// ------------------------------------------------

console.log("Server started ");

// middleware for uploading files
upload = require("express-fileupload");
app.use(upload());
// middleware to serve css, js and images
app.use(express.static(__dirname + '/public'));


// Post request from addRecs
app.post("/addRecs", async function (req, res) {


  // if the file is found, save it to the reciepts folder
  if (req.files) {
    var file = req.files.imgPath,
      filename = file.name;
    var fullFilepath = __dirname + filename;

    file.mv(fullFilepath, async function (err) {
      if (err) {
        res.send("error occured");
      } else {
          const testFunction = require("./callMe.js");
       
       // result holds object that is returned from callMe test function
       result = await testFunction(fullFilepath);

        // renders (redirects) to the data validation page, passing the result object 
       res.render('dataValidationPage.ejs', result );
 
        
      }
    });
  }
});

app.post("/dataValidationPage",function(req,res)
{

    const rebateData = require("./models/rebate.js");
    // creates schema
     const newData = new rebateData ({

         clinicName: result.clinicName,
         clinicAddress: result.clinicAddress,
         invoiceDate: result.invoiceDate,
         patient: result.patient,
         items: result.items,

     })

    // saves to database
    newData.save(function (error,document){
     if (error) console.error(error)

    console.log(document);

        items = [];


    })
    console.log("post from validation");
    res.render('summaryOfUpload.ejs', result);

});