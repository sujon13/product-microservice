const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const Product = require('./models/Product');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if(!token)return res.status(401).send({error: 'Access Denied! Token is invalid'});

    //verify a token symmetric
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if(err)return res.status(401).send(err);
        console.log(decoded);
        req.user = decoded;
        next();
    });

}

module.exports.verifyToken = verifyToken;