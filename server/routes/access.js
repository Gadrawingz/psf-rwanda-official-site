/**********************************
This page shows all the routes specific to accounts, 
registration, application, login and authentication
This page will use: layout: 'layouts/LAccess'
***********************************/

const express = require('express')
const router = express.Router();
const sql = require('mysql')
const DBConn = require('../config/database');


// To be able to send flash
const flash = require('express-flash')
router.use(flash())


// 01. Forgot admin password view
router.get('/forgot-password', (req, res) => {
    const internals = {
        title: "Reset Password",
        message: req.flash('flashError')
    }
    res.render('admin/account/forgot', { 
        layout: './layouts/LAccess', internals 
    });
});


// 02. Forgot admin post
router.post('/forgot-password-post', (req, res) => {
    let email = req.body.email;
    req.flash('flashError', "Please contact in IT Department")
    res.redirect('/panel/forgot-password');
})


// 03. Admin Login view
router.get('/login', (req, res) => {
    const internals = {
        title: "Staff Login",
        description: "PSF Staff member login page",
        message: req.flash('flashError')
    }
    res.render('admin/account/login', { 
        layout: './layouts/LAccess', internals 
    });
});


// 04. Admin Login Authentication
router.post('/login-auth', (req, res) => {
    let email = req.body.email;
    let role  = req.body.role;
    let password = req.body.password;

    if(email && role && password) {
        const sql ='SELECT * FROM admin WHERE email=? AND role=? AND password=?'
        
        DBConn.query(sql, [email, role, password], (err, results, fields) => {
            if(err) throw err;
            if(results.length > 0) {

                // Authenticate:
                req.session.loggedin = true;
                req.session.adminId = results[0].admin_id;
                req.session.username = results[0].username;
                req.session.firstname = results[0].firstname;
                req.session.lastname = results[0].lastname;
                req.session.gender = results[0].username;

                req.flash('flashSuccess', "Login is successful")
                res.redirect('/panel/dashboard');
            } else {
                req.flash('flashError', "Wrong email, role or password!");
                res.redirect('/panel/login');
            }
            res.end();
        })
    } else {
        // res.locals.success = req.flash('success');
        req.flash('flashError', "Please fill all required fields!");
        res.redirect('/panel/login');
        res.end()
    }
})


// 05. Admin dashboard view
router.get(['', '/dashboard'], (req, res) => {
    if(req.session.loggedin) {
        // Local stuffs:
        const internals = {
            title: "Dashboard Page",
            breadcrumbL1: "Dashboard",
            breadcrumbL2: "Home",
            // Logged-in user details
            adminId: req.session.adminId,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
        }
        res.render('admin/dashboard', 
            { layout: './layouts/LAdmin', internals }
        )
    } else {
        // Please get back here and login
        req.flash('flashError', "Please login to access dashboard!");
        res.redirect('/panel/login')
    }
    res.end();
});


// 05. Logout...
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        console.log('Successfully signed out!');
        res.redirect('/panel/login')
    })
})


// 06. Edit Admin (Profile Update)
// By using Admin Template????????
router.get('/profile', (req, res) => {
    if(req.session.loggedin) {
        const internals = {
            title: `Edit your profile (${req.session.username})`,
        }

        res.render('admin/account/profile', {
            layout: './layouts/LAdmin', internals
        });
    } else {
        req.flash('flashError', "Login to access your profile!");
        res.redirect('/panel/login');
    }
})




// Export this router
module.exports = router;