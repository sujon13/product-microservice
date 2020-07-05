const express = require('express');
const app = express();

// common middlewire
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// import routes
const productRoute = require('./routes/product');
app.use('/api/v1/products', productRoute);
const categoryRoute = require('./routes/category');
app.use('/api/v1/categories', categoryRoute);


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
