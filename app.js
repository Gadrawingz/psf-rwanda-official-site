// Main imports and definition
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const eLayout = require('express-ejs-layouts');
const cors = require('cors')
const bodyParser = require('body-parser');

const app = express();
const PORT = 5005 || process.env.PORT;


// Setting up custom default layout
app.set('layout', './layouts/LClients');
app.set('view engine', 'ejs');

// Enabling express-session and flash
app.use(cors())
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//app.use(express.urlencoded({ extended: true}))
app.use(session({
    secret : 'psf-secret1',
    resave : false,
    saveUninitialized : false,
    cookie: {
        maxAge: 21600000, // 6hrs
    }
}))

app.use(express.static('public/'));
app.use(eLayout);


// Routes 
// For clients
app.use('/', require('./server/routes/clients'))
app.use('/view/', require('./server/routes/clients-view'))

// For admin Panel
app.use('/panel', require('./server/routes/access'))
app.use('/posts', require('./server/routes/posts'));
app.use('/publica', require('./server/routes/publica'));
app.use('/gallery', require('./server/routes/gallery'));
app.use('/messages', require('./server/routes/messages'));

// Running
app.listen(PORT, ()=> {
    console.log(`Just listening on port ${PORT}`);
})