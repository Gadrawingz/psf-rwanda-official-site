/**********************************
This page shows all the routes specific 
to admin table, and related pages
***********************************/
const express = require('express')
const router = express.Router();
const sql = require('mysql')
const DBConn = require('../config/database');

// To be able to send flash...
const flash = require('express-flash')
router.use(flash())





// 01. Register view
// 02. Register Post


// 03. Admin Login view
router.get('/register', (req, res) => {
    const internals = {
        title: "Staff Login",
    }
    res.render('admin/account/register', { layout: './layouts/LAdmin', internals });
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
                res.redirect('/login');
            }
            res.end();
        })
    } else {
        // res.locals.success = req.flash('success');
        req.flash('flashError', "Please fill all required fields!");
        res.redirect('/login');
        res.end()
    }
})


// 03. Admin dashboard view
router.get('/dashboard', (req, res) => {
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
        res.redirect('/login')
    }
    res.end();
});




// Export this router
module.exports = router;