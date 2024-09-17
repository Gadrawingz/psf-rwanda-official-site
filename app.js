// Main imports and definition
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const eLayout = require('express-ejs-layouts');

const app = express();
const PORT = 5005 || process.env.PORT;

// Setting up custom default layout
app.set('layout', './layouts/LClients');
app.set('view engine', 'ejs');

// Enabling express-session and flash
app.use(express.json());
app.use(express.urlencoded({ extended: true}))

app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true,
    cookie: {
        maxAge: 21600000, // 6hrs
    }
}))


// Usage1
app.use(express.static('public/'));
app.use(eLayout);


// Routes 
// For clients
app.use('/', require('./server/routes/clients'))

// For admin Panel
app.use('/panel', require('./server/routes/access'))
app.use('/panel', require('./server/routes/admin'))


// Running
app.listen(PORT, ()=> {
    console.log(`Just listening on port ${PORT}`);
})