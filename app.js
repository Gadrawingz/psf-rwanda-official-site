// Main imports and definition
require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const app = express();
const PORT = 5005 || process.env.PORT;

// Middleware section
app.use(express.static('public'));

// Render with EJS
app.use(expressLayout);
app.set('layout', './layouts/clients');
app.set('view engine', 'ejs');

// Main Routing Point
app.use('/', require('./server/routes/clients'))


// Running
app.listen(PORT, ()=> {
    console.log(`Just listening on port ${PORT}`);
})