const Product = require('../models/Product');

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
        res.status(500).send(error);
    }
    product.updatedAt = Date.now();
    req.product = product;
    
    if(req.body.rating !== undefined) {
        const productRating = product.rating;
        const totalRatings = productRating.totalRatings + req.body.rating;
        const ratingsEntry = productRating.ratingsEntry+ 1;
        const avgRating = totalRatings / ratingsEntry;
        const detailsRating = productRating.detailsRating;
        detailsRating[req.body.rating - 1] += 1;
        req.updatedRating = {
            avgRating: avgRating,
            totalRatings: totalRatings,
            ratingsEntry: ratingsEntry,
            detailsRating: detailsRating
        };
    }
    next();
};


const productUpdate = async (req, res, next) => {
    const details = req.body.details;
    if(details === undefined)next();

    req.updatedDetails = {
        "color": details.color
    }
    next();

}

const search = async (req, res, next) => {
    const searchString = req.query.search;
    console.log(searchString);
    
    const query = Product.aggregate([
        {$match: { 'name':          new RegExp(searchString, "i") }},
        {$match: { 'imageUrl':      new RegExp(searchString, "i") }},
        {$match: { 'description':   new RegExp(searchString, "i") }},
        {$match: { 'details.color': new RegExp(searchString, "i") }},
        {$match: { 'details.brand': new RegExp(searchString, "i") }},
        {$match: { 'details.model': new RegExp(searchString, "i") }},
    ]);

    //const query = Product.aggregate(queryArray);
    req.customizedQuery = query;
    next();
      
}

module.exports.createProduct = createProduct;
module.exports.ratingUpdate = ratingUpdate;
module.exports.productUpdate = productUpdate;
module.exports.search = search;