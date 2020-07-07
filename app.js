const express = require('express');
const app = express();
const createError = require('http-errors');

// common middlewire
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// custom middlewire
const { log } = require('./routes/middleware');
app.use(log);


// import routes
const productRoute = require('./routes/product');
app.use('/api/v1/products', productRoute);
const categoryRoute = require('./routes/category');
app.use('/api/v1/categories', categoryRoute);
const searchRoute = require('./routes/search');
app.use('/api/v1/search', searchRoute);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    console.error(`statusCode: ${err.statusCode}`);
    console.error(`message: ${err.message}`);
    console.error(`stack: ${err.stack}`);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    if(err.statusCode && err.statusCode != 500) {
        res.status(err.statusCode).send(err.message);
    } else {
        res.status(500).send("Internal server error");
    }
});


// connect db
const mongoose = require('mongoose');
require('dotenv/config');
// for mongoose 
mongoose.set('useFindAndModify', false);

mongoose.connect(
    process.env.DB_CONNECTION,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    },
    () => {
        console.log('connected to product database');
    }
)

app.listen(3100, () => console.log(`product server is up and running`));
