const express = require('express');
const router = express.Router();
const createError = require('http-errors');

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
const { verifyAdmin } = require('./middleware');

router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch(error) {
        next(error);
    }
})

// only admin
router.post('/', verifyAdmin, upload.single('image'), async (req, res, next) => {
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

        if(!!savedParentCategory) {
            res.status(201).send(savedCategory);
        } else {
            next(createError(500, 'Parent category could not be saved'));
        }
    } catch(error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if(!!category) {
            res.status(200).send(category);
        } else {
            next(createError(404, ` Category ${req.params.id} not found!`));
        }
    } catch(error) {
        next(error);
    }
});

// only admin
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res, next) => {
    const body = req.body;
    console.log(req.file);

    try {
        const category = await Category.findById(req.params.id);
        if(!category) {
            return next(createError(404, `category ${req.params.id} not found!`));
        }

        category.imageUrl = req.file.path;
        for(const property in body) {
            category[property] = body[property];
        }

        const updatedCategory = await category.save();
        if(!!updatedCategory) {
            res.status(200).send(updatedCategory);
        } else {
            next(createError(500, 'Category could not be updated'));
        }
    } catch(error) {
        next(error);
    }
})

module.exports = router;