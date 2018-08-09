const express = require('express');
// Using Node.js `require()`
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//Config global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;

    console.log('BD OK');
});

app.listen(process.env.PORT, () => {
    console.log('Puerto', process.env.PORT)
});