const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if(!token)return next(createError(401, 'Access Denied! Token is invalid'));

    //verify a token symmetric
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        console.log(decoded);
        if(err) {
            next(createError(401, err));
        } else if (decoded.isAccessToken === false) {
            next(createError(401, 'Access Denied! Token is invalid'));
        } else {
            req.user = decoded;
            next();
        }
    });

}

const verifyAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if(!token)return next(createError(401, 'Access Denied! Token is invalid'));

    //verify a token symmetric
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        console.log(decoded);
        if(err) {
            next(createError(401, err));
        } else if (decoded.isAccessToken === false) {
            next(createError(401, 'Access Denied! Token is invalid'));
        } else if(decoded.isAdmin === false) {
            next(createError(401, 'Access Denied! You do not have enough permission!'));
        } else {
            req.user = decoded;
            next();
        }
    });

}

module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin= verifyAdmin;