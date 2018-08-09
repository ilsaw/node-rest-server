const express = require('express');
// Using Node.js `require()`
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));


module.exports = app;