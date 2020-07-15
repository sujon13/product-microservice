const createError = require('http-errors');

const pageAndLimitValidation = async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
        return next(createError(400, 'query parameter is invalid'));
    }

    req.page = page;
    req.limit = limit;
    next();
};

const mongoDbIdValidation = async (req, res, next) => {
    const mongoDbIdChecker = new RegExp('^[0-9a-fA-F]{24}$');
    const id = req.params.id;
    if (id === undefined) {
        next();
        return;
    }
    if (mongoDbIdChecker.test(id) === false) {
        return next(createError(400, 'id is invalid'));
    }
    next();
};

module.exports.pageAndLimitValidation = pageAndLimitValidation;
module.exports.mongoDbIdValidation = mongoDbIdValidation;
