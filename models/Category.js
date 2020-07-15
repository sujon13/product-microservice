const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200
    },
    imageUrl: {
        type: String,
        required: false
    },
    description: String,
    parent_id: {
        type: String
    },
    children_id: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

CategorySchema.index({ '$**': 'text' });

//ProductSchema.plugin(mongoosePaginate);
CategorySchema.plugin(aggregatePaginate);

module.exports = mongoose.model('Category', CategorySchema);
