const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new Schema({

    product: {
        type: String,
        required: true
    },
    category:{
        type: String,
    }
 
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product;