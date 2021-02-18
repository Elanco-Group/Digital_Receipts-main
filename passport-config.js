const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require("./models/user.js");

function initialize(passport, ){
    const authenticateUser = async (email, password, done) =>{
        //const user = getUserByEmail(email)
        var user = await userByEmail(email)
        console.log(user)
        //database search for user by email and return user object
        if (user == null){
            return done(null, false,{ message: 'Invalid login. Please try again'})
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'Invalid login. Please try again'})
            }
        } catch (error){
            return done (error)
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'email'},
    authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id)
        done(user ? null : 'No User', user)
    })
}

async function userByEmail(email) {
    return await User.findOne({ emailAddress: email } 
   
    );
};

module.exports = initialize

