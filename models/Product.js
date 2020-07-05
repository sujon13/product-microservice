const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200
    },
    price: {
        type: Number,
        required: true
    },
    categoryId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number
    },
    imageUrl: {
        type: String,
        required: false
    },
    description: String,
    details: {
        color: String,
        size: {
            type: [String]

        },
        brand: String,
        model: String,
        sex: String,
        weight: Number,
        expiryDate: Date,
        ProductCreatedAt: Date
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true
    },
    isNewProduct: {
        type: Boolean
    },
    discount: {
        type: Number,
        default: 0
    },
    rating: {
        avgRating: Number,
        totalRatings: {
            type: Number,
            default: 0
        },
        ratingsEntry: {
            type: Number,
            default:0
        },
        detailsRating: {
            type: [Number],
            default: [0,0,0,0,0]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }   
})

ProductSchema.index({'$**': 'text'});

//ProductSchema.plugin(mongoosePaginate);
ProductSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('Product', ProductSchema);