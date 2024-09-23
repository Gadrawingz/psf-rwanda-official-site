/**********************************
This page shows all the routes specific to posts, 
registration, updates, removal, etc.
This page will use: layout: 'layouts/LAccess'
***********************************/

const express = require("express");
let session = require("express-session");
const router = express.Router();
const sql = require("mysql");
const DBConn = require("../config/database");

// To be able to send flash
const flash = require("express-flash");
router.use(flash());

router.get("/add", (req, res) => {
    if (req.session.loggedin === true && req.session.loggedin != undefined) {
      const internals = {
        title: "Make a new post",
        breadcrumbL1: "Post",
        breadcrumbL2: "New",
        role: req.session.role,
        adminId: req.session.adminId,
        username: req.session.username,
        telephone: req.session.telephone,
        fullName: `${req.session.firstname} ${req.session.lastname}`,
        message: req.flash("flashMessage")
      };
  
      res.render("admin/posts/add-post", {
        layout: "./layouts/LAdmin",
        internals,
      });
    } else {
      req.flash("flashError", "Login to register user!");
      res.redirect("/panel/login");
    }
});



router.get(['/all'], (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    // Local stuffs:
    const internals = {
      title: "Press Releases (Posts)",
      breadcrumbL1: "Posts",
      breadcrumbL2: "All",
      // Logged-in user details
      role: req.session.role,
      adminId: req.session.adminId,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
    };
    res.render("admin/posts/view-posts", { layout: "./layouts/LAdmin", internals });
  } else {
    // Please get back here and login
    req.flash("flashError", "Please login to access dashboard!");
    res.redirect("/panel/login");
  }
  res.end();
});



// Export this
module.exports = router;