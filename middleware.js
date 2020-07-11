const Product = require('./models/Product');
const createError = require('http-errors');

const createProduct = (req, res, next) => {
    const body = req.body;

    const product = new Product({
        name: body.name,
        price: body.price,
        categoryId: body.categoryId,
        quantity: body.quantity,
        description: body.description,
        details: body.details,
        isAvailable: body.isAvailable,
        isNewProduct: body.isNewProduct,
        discount: body.discount,
        rating: body.rating,
    });

    req.product = product;
    next();
};

const ratingUpdate = async (req, res, next) => {

    try {
        var product  = await Product.findById(req.params.id);
        if(!product)return res.status(404).send();
    } catch(error) {
        return next(createError(404, `Product ${req.params.id} not found!`));
    }
    
    if(req.body.rating !== undefined) {
        const productRating = product.rating;
        const totalRatings = productRating.totalRatings + req.body.rating;
        const ratingsEntry = productRating.ratingsEntry+ 1;
        const avgRating = totalRatings / ratingsEntry;
        const detailsRating = productRating.detailsRating;
        detailsRating[req.body.rating - 1] += 1;
        product.rating = {
            avgRating: avgRating,
            totalRatings: totalRatings,
            ratingsEntry: ratingsEntry,
            detailsRating: detailsRating
        };

    }

    product.updatedAt = Date.now();
    req.product = product;
    next();
};

const log = (req, res, next) => {
    const logObject = {
        path: req.originalUrl,
        method: req.method
    };
    
    if(req.method === 'POST') {
        logObject.body = req.body;
    }
    console.dir(logObject);
    next();
}

module.exports.createProduct = createProduct;
module.exports.ratingUpdate = ratingUpdate;
module.exports.log = log;