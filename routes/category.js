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


const Category = require('../models/Category');
const { createProduct, ratingUpdate, productUpdate, search } = require('./middleware');

/*
router.get('/', search, async (req, res) => {
    const searchString = req.query.search;
    const page = req.query.page;
    const limit = req.query.limit;
    const options = {
        page: req.query.page,
        limit: req.query.limit
    };
    try {
        //const query = Product.aggregate([{$match: { 'details.brand': /par/i }}]);
        //const products = await Product.aggregatePaginate(req.customizedQuery, options);
        //const products = await Product.find( $or: [{ 'details.brand': /easy/i}]);
        const products = await Product.find(
            {
                $or: [
                    {'details.brand': new RegExp(searchString, "i") },
                    {'details.model': new RegExp(searchString, "i") },
                    {'details.color': new RegExp(searchString, "i") },
                    {'details.model': new RegExp(searchString, "i") },
                    {'name': new RegExp(searchString, "i") },
                    {'description': new RegExp(searchString, "i") },
                    {'imageUrl': new RegExp(searchString, "i") }

                ]
            }
        );
        //console.log(products);

        res.status(200).send(products);
    } catch(error) {
        console.log(error);
        res.status(404).send({error: error});
    }
});
*/

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch(error) {
        res.send(error);
    }
})

router.post('/', upload.single('image'), async (req, res) => {
    
    const body = req.body;
    
    const category = new Category({
        name: body.name,
        imageUrl: req.file.path,
        description: body.description,
        parent_id: body.parent_id
    });

    try {
        const savedCategory = await category.save();
        if(!savedCategory)return res.sendStatus(500);

        const parentCategory = await Category.findById(body.parent_id);

        if(!parentCategory) {
            return res.status(201).send(savedCategory);
        }
        
        const id = savedCategory._id.toString();
        parentCategory.children_id.push(id);
        const savedParentCategory = await parentCategory.save();
        if(!savedParentCategory)return res.sendStatus(500);    
        
        res.status(201).send(savedCategory);
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if(!category)return sendStatus(404);
        
        res.status(200).send(category);
    } catch(error) {
        res.send(error);
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    const body = req.body;
    console.log(req.file);

    try {
        const category = await Category.findById(req.params.id);
        if(!category)return res.sendStatus(404);
        
        category.imageUrl = req.file.path;
        for(const property in body) {
            category[property] = body[property];
        }

        const updatedCategory = await category.save();
        if(updatedCategory) {
            res.status(200).send(updatedCategory);
        } else {
            res.sendStatus(500);
        }
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/*
router.put('/:id', upload.single('image'), async (req, res) => {
    const body = req.body;
    console.log(req.file);

    try {
        const category = await Category.findByIdAndUpdate(req.params.id, 
            {
                $set: {
                    description: body.description,
                    imageUrl: req.file.path
                }
            },
            {
                new: true
            }
        );
        if(category) {
            res.status(200).send(category);
        } else {
            res.sendStatus(404);
        }
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});
*/

module.exports = router;