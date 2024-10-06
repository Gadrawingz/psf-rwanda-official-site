/**********************************
This page shows all the routes specific to accounts, 
registration, app dashboard, login and authentication
This page will use: layout: 'layouts/LAccess'
***********************************/

const express = require("express");
const router = express.Router();
const con = require("../config/database");


// To be able to send flash
const flash = require("express-flash");
router.use(flash());

// 01. Forgot admin password view
router.get("/forgot-password", (req, res) => {
  const internals = {
    title: "Reset Password",
    message: req.flash("flashError"),
  };
  res.render("admin/account/forgot", {
    layout: "./layouts/LAccess",
    internals,
  });
});


// 02. Forgot admin post
router.post("/forgot-password-post", (req, res) => {
  let email = req.body.email;
  req.flash("flashError", "Please contact in IT Department");
  res.redirect("/panel/forgot-password");
});


// 03. Admin Login view
router.get("/login", (req, res) => {
  const internals = {
    title: "Staff Login",
    description: "PSF Staff member login page",
    message: req.flash("flashError"),
  };
  res.render("admin/account/login", {
    layout: "./layouts/LAccess",
    internals,
  });
});

// 04. Admin Login Authentication
router.post("/login-auth", (req, res) => {
  let email = req.body.email;
  let role = req.body.role;
  let password = req.body.password;

  if (email && role && password) {
    const sql = "SELECT * FROM admin WHERE email=? AND role=? AND password=?";

    con.query(sql, [email, role, password], (err, results, fields) => {
      req.session.loggedin = true;
      req.session.role = results[0].role;
      req.session.adminId = results[0].admin_id;
      req.session.username = results[0].username;
      req.session.firstname = results[0].firstname;
      req.session.lastname = results[0].lastname;

      if (err) throw err;
      if (results.length > 0) {
        // Authenticate:
        res.redirect("/panel/dashboard");
      } else {
        req.flash("flashError", "Wrong email, role or password!");
        res.redirect("/panel/login");
      }
      res.end();
    });
  } else {
    // res.locals.success = req.flash('success');
    req.flash("flashError", "Please fill all required fields!");
    res.redirect("/panel/login");
    res.end();
  }
});


// 05. Admin dashboard view
router.get(["", "/dashboard"], (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    // Local stuffs:
    const internals = {
      title: "Dashboard Page",
      breadcrumbL1: "Dashboard",
      breadcrumbL2: "Home",
      // Logged-in user details
      role: req.session.role,
      adminId: req.session.adminId,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
    };

    let publiCount = 30;
    let postsCount = 20;
    let galleryNum = 18;
    let appManagers = 4;

    res.render("admin/dashboard", { 
      layout: "./layouts/LAdmin", 
      internals, publiCount, postsCount, galleryNum, appManagers
    });
  } else {
    // Please get back here and login
    req.flash("flashError", "Please login to access dashboard!");
    res.redirect("/panel/login");
  }
  res.end();
});


// 06. Logout...
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log("Successfully signed out!");
    res.redirect("/panel/login");
  });
});


/*************************************************
 * This section below will be using Admin Template
 * ***********************************************/

// 07. Register a new admin
router.get("/register", (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    const internals = {
      title: "Register new admin",
      breadcrumbL1: "Admin",
      breadcrumbL2: "Registration",
      role: req.session.role,
      adminId: req.session.adminId,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
    };

    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
    });
  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});


// 07.B. POST register admin
router.post('/register-admin', (req, res) => {
  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  let ro = req.body.role;
  let pw = req.body.password;

  let adminData = {
    firstname: fn, lastname: ln, username: un, gender: gd, 
    telephone: te, email: em, role: ro, password: pw,
  }

  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && em.length != 0 && ro.length != 0 && pw.length != 0) {
    if(te.length >= 10) {
      if(pw.length > 4) {
        con.query('INSERT INTO `admin` SET ?', adminData, (err, result) => {
          if(err) {
            req.flash("fmessage", "Internal Error!");
            res.redirect("/panel/register");
          } else {
            res.redirect('/panel/admins');
          }
        })
      } else {
        req.flash("fmessage", "Phone number cannot go below 10 numbers!");
        res.render("admin/account/register", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        })
      }
    } else {
      req.flash("fmessage", "Phone number cannot go below 10 numbers!");
      res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
    });
    }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
    });
  }
})


// 08. Retrieve all system users.
router.get("/admins", (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    con.query("SELECT * FROM admin", (error, rows) => {
      let internals = {
        title: "All PSF admins",
        adminId: req.session.adminId,
        username: req.session.username,
        telephone: req.session.telephone,
        data: rows, // selected ones
      };
      
      if (!error) {
        res.render("admin/account/admins", {
          layout: "./layouts/LAdmin",
          internals,
          message: "",
        });
      } else {
        req.flash("flashError", "No data available");
        res.render("admin/account/admins", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "Login to view admins");
    res.redirect("/panel/login");
  }
});


// 09. Remove admin record
router.get('/del-admin/(:theId)', (req, res) => {
    let id = req.params.theId;
    let sql = `DELETE FROM admin WHERE admin_id = ${id}`
    con.query(sql, (error, result) => {
        if(error) {
            req.flash('flashError', "Cannot remove this record");
            res.redirect('/panel/admins');
        } else {
            req.flash('success', "Admin record has been removed!");
            res.redirect('/panel/admins');
        } 
    })
})




// Export this router
module.exports = router;