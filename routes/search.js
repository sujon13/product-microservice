const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Category = require('../models/Category');
//const { createProduct, ratingUpdate, productUpdate, search } = require('./middleware');



class Dfs {
    constructor(categoryList, categoryIdList) { 
        this.categoryList = categoryList;
        this.categoryIdList = categoryIdList;
        this.finalIdList = new Set();
        this.visit = {};
        this.finalCategoryList = new Set();
    }

    getFinalList = () => {
        for(const id of this.categoryIdList) {
            this.dfs(id);
        }
        return {
            finalIdList: [...this.finalIdList],
            finalCategoryList: [...this.finalCategoryList]
        };  
    };

    dfs = id => {
        this.visit[id] = true;
        const category = this.findById(id);
        
        if(this.isEmpty(category.children_id)) {
            this.finalIdList.add(id);
            this.finalCategoryList.add(category);
        } else {
            for (const tempIdId  of category.children_id) {
                if(this.visit[tempIdId] === undefined || this.visit[tempIdId] === false) {
                    this.dfs(tempIdId);
                }
            }
        }
    };

    isEmpty = children_id => {
        let count = 0;
        for(const id of children_id) {
            count++;
            break;
        }
        return count === 0;
    };

    findById = id => {
        for(const category of this.categoryList) {
            const _id = category._id.toString();
            if(_id === id)return category;
        }
    }
}

const matchWithCategory = async (req, res, next) => {
    const searchString = req.query.search;

    let categoryList = [], filteredCategoryIdList = [];
    try {
        categoryList = await Category.find();
        if(!categoryList)return res.sendStatus(404);

        for(const category of filteredCategoryList) {
            let found = category.name.search(new RegExp(searchString, "i"));
            found += category.description.search(new RegExp(searchString, "i"));
            found += category.imageUrl.search(new RegExp(searchString, "i"));
            if(found > -3) {
                categoryIdList.push(category._id.toString());
            }
        }
    } catch(error) {
        console.log(error);
        return res.send(error);
    }
    
    const dfs = new Dfs(categoryList, filteredCategoryIdList);
    const { finalIdList, finalCategoryList } = dfs.getFinalList();
    req.categoryIdList = finalIdList;
    req.categoryList = finalCategoryList;
    next();
}

router.get('/', matchWithCategory, async (req, res) => {
    const searchString = req.query.search;
    
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    

    try {
        const products = await Product.find(
            {
                $or: [
                    { 'details.brand': new RegExp(searchString, "i") },
                    { 'details.model': new RegExp(searchString, "i") },
                    { ' details.color': new RegExp(searchString, "i") },
                    { 'details.model': new RegExp(searchString, "i") },
                    { 'name': new RegExp(searchString, "i") },
                    { 'description': new RegExp(searchString, "i") },
                    { 'imageUrl': new RegExp(searchString, "i") },
                    { 'categoryId' : { $in : req.categoryIdList }}// for category matching
                ]
            },
            'name categoryId',
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

router.get('/:categoryId', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const categoryId = req.params.categoryId;

    let categoryList = [];
    try {
        categoryList = await Category.find();
    } catch(error) {
        return res.sendStatus(500);
    }

    const dfs = new Dfs(categoryList, [categoryId]);
    const { finalCategoryList } = dfs.getFinalList();
    
    try {
        const products = await Product.find(
            {
                'categoryId' : categoryId // for category matching
            },
            'name categoryId',
            {  
                skip: (page - 1) * limit,
                limit: limit
            }
        );
        const response = {
            categories: finalCategoryList,
            products: products
        };
        res.status(200).send(response);
    } catch(error) {
        console.log(error);
        res.status(404).send({error: error});
    }
});

module.exports = router;
