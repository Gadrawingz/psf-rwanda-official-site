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

// Middleware f(x) to check and set default session data across the pages
app.use((req, res, next) => {
    if (!req.session.in_user) {
        // To check if user is logged in, if not, set default values
        req.session.in_user = {
            loggedin : false,
            role: "visitor",
            user_id: 0,
            username: "Guest",
            firstname: "",
            lastname: "",
        };
    }
    // Passing control to the next middleware or route handler
    next();
});

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
app.use('/events', require('./server/routes/events'));
app.use('/documents', require('./server/routes/documents'));


// Running
app.listen(PORT, ()=> {
    console.log(`Just listening on port ${PORT}`);
})