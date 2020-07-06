const express = require('express');
const router = express.Router();

// multer
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter  = (req, file, cb) => {
    const fileExtension = file.mimetype;
    const acceptableExtensionList = ['image/jpeg', 'image/jpg', 'image/png'];

    if(acceptableExtensionList.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
   
}
const upload = multer({
    storage: storage,
    limits: {
        maxFileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});


const Product = require('../models/Product');
const { createProduct, ratingUpdate, productUpdate, search } = require('./middleware');


router.get('/', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    

    try {
        //const query = Product.aggregate([{$match: { 'details.brand': /par/i }}]);
        //const products = await Product.aggregatePaginate(req.customizedQuery, options);
        //const products = await Product.find( $or: [{ 'details.brand': /easy/i}]);
        const products = await Product.find(
            {},
            'name description',
            {  
                skip: (page - 1) * limit,
                limit: limit
            }
        );

        res.status(200).send(products);
    } catch(error) {
        console.log(error);
        res.status(404).send({error: error});
    }
});


router.post('/', createProduct, async (req, res) => {
    const product = req.product;

    try {
        const savedproduct = await product.save();
        if(!savedproduct) {
            console.log('product could not be saved');
            return res.status(500).send({error: 'Internal server error'});
        }
        res.status(201).send(savedproduct);
    } catch(error) {
        console.log(error);
        res.status(500).send({error: 'Internal server error'});
    }
});

router.get('/:id', async (req, res)=> {
    console.log(req.params.id);
    try {
        const product = await Product.findById(req.params.id);

        if(!product)return res.status(404).send('Not found');
        res.status(200).send(product);
    } catch(eror) {
        console.log(error);
        res.status(500).send();
    }
})

// update except image
router.put('/:id', ratingUpdate, async (req, res) => {
    const body = req.body;

    try {
        const product = req.product;
        for(const property in body) {
            if (property === 'rating')continue;
            else if(property === 'details') {
                for(const d_property in body.details) {
                    product.details[d_property] = body.details[d_property];
                }
            } else {
                product[property] = body[property];
            }
        }

        const updatedProduct = await product.save();
        if(!updatedProduct)return res.status(500).send();
        res.status(200).send(updatedProduct);

    } catch(error) {
        return res.status(500).send(error);
    }
})

// only image update
router.put('/image/:id', upload.single('image'), async (req, res) => {
    const body = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
            {
                $set: {
                    imageUrl: req.file.path
                }
            },{
                new: true
            }
        );
        if(updatedProduct) {
            res.status(200).send(updatedProduct);
        } else {
            res.sendStatus(500);
        }
    } catch(error) {
        return res.status(500).send(error);
    }
});

router.delete('/:id', async (req, res)=> {
    console.log(req.params.id);
    try {
        const options = {
            select: ["name"]
        };
        const product = await Product.findByIdAndDelete(req.params.id,options);

        if(!product)return res.status(404).send('Not found');
        res.status(200).send(product);
    } catch(error) {
        console.log(error);
        res.status(500).send();
    }
});


module.exports = router;