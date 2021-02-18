const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    emailAddress:{
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;