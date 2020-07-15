const express = require('express');
const router = express.Router();
const createError = require('http-errors');

// multer
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    const fileExtension = file.mimetype;
    const acceptableExtensionList = ['image/jpeg', 'image/jpg', 'image/png'];

    if (acceptableExtensionList.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        maxFileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});

const Product = require('../models/Product');
const { createProduct, ratingUpdate } = require('../middleware');
const { verifyToken, verifyAdmin } = require('../verification');
const {
    pageAndLimitValidation,
    mongoDbIdValidation
} = require('../validation');

router.get('/', pageAndLimitValidation, async (req, res, next) => {
    const page = req.page;
    const limit = req.limit;

    try {
        const products = await Product.find({}, 'name description imageUrl', {
            sort: { 'rating.avgRating': -1 },
            skip: (page - 1) * limit,
            limit: limit
        });

        res.status(200).send(products);
    } catch (error) {
        next(error);
    }
});

// only admin
router.post('/', verifyAdmin, createProduct, async (req, res, next) => {
    const product = req.product;

    try {
        const savedProduct = await product.save();
        if (!!savedProduct) {
            res.status(201).send(savedProduct);
        } else {
            next(createError(500, 'Product could not be saved'));
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id', mongoDbIdValidation, async (req, res, next) => {
    console.log(req.params.id);
    try {
        const product = await Product.findById(req.params.id);
        if (!!product) {
            res.status(200).send(product);
        } else {
            next(createError(404, `Product ${req.params.id} not Found!!`));
        }
    } catch (error) {
        next(error);
    }
});

// update except image
router.put(
    '/:id',
    verifyToken,
    mongoDbIdValidation,
    ratingUpdate,
    async (req, res, next) => {
        const body = req.body;

        try {
            const product = req.product;
            for (const property in body) {
                if (property === 'rating') continue;
                else if (property === 'details') {
                    for (const d_property in body.details) {
                        product.details[d_property] = body.details[d_property];
                    }
                } else {
                    product[property] = body[property];
                }
            }

            const updatedProduct = await product.save();
            if (!!updatedProduct) {
                res.status(200).send(updatedProduct);
            } else {
                next(createError(500, 'Product can not be updated!'));
            }
        } catch (error) {
            next(error);
        }
    }
);

// only image update
// only admin
router.put(
    '/:id/image',
    verifyAdmin,
    mongoDbIdValidation,
    upload.single('image'),
    async (req, res, next) => {
        const body = req.body;

        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        imageUrl: req.file.path
                    }
                },
                {
                    new: true
                }
            );
            if (!!updatedProduct) {
                res.status(200).send(updatedProduct);
            } else {
                next(createError(500, 'Image could not be uploaded'));
            }
        } catch (error) {
            next(error);
        }
    }
);

// only admin
router.delete(
    '/:id',
    verifyAdmin,
    mongoDbIdValidation,
    async (req, res, next) => {
        try {
            const options = {
                select: ['name']
            };
            const product = await Product.findByIdAndDelete(
                req.params.id,
                options
            );

            if (!!product) {
                res.status(200).send(product);
            } else {
                next(createError(404, `product ${req.params.id} not found!`));
            }
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
