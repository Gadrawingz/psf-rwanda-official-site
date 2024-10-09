/**********************************
This page shows all the routes specific to accounts, 
registration, app dashboard, login and authentication
This page will use: layout: 'layouts/LAccess'
***********************************/

const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const con = require("../config/database");


// To be able to send flash
const flash = require("express-flash");
const session = require("express-session");
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
  let role = req.body.admin_role;
  let password = req.body.password;

  if (email.length!=0 && role.length!=0 && password.length!=0) {
    con.query('SELECT * FROM admin WHERE email = ? AND role = ?', [email, role], (error, results, fields) => {
      if (error) {
        req.flash("flashError", "Internal Error (in the system)!");
        res.redirect("/panel/login");
      }

      if(results.length > 0) {
        let match = bcrypt.compareSync(password, results[0].password);
        if(match==true) {
          if(results[0].status=='Active') {
            // If everything is okay, initialize session
            req.session.loggedin = true;
            req.session.role = results[0].role;
            req.session.admin_id = results[0].admin_id;
            req.session.username = results[0].username;
            req.session.firstname = results[0].firstname;
            req.session.lastname = results[0].lastname;
            // Authenticate...
            res.redirect("/panel/dashboard");
          } else {
            req.flash("flashError", "Oops! Your account is not activated!");
            res.redirect("/panel/login");
          }
        } else {
          req.flash("flashError", "Wrong password!");
          res.redirect("/panel/login");
        }
      } else {
        req.flash("flashError", "Email & role do not match!");
        res.redirect("/panel/login");
      }
    });
  } else {
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
      admin_role: req.session.admin_role,
      admin_id: req.session.admin_id,
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
      admin_id: req.session.admin_id,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
    };
    // On insert form 1, no data on value to be there!
    let fn, ln, un, gd, te, em, ro, pw = ''; 
    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, pw
    });
  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});


// 07.B. POST register admin
router.post('/register-admin', (req, res) => {

  let internals = {
    title: "Register new admin",
    breadcrumbL1: "Admin",
    breadcrumbL2: "Registration",
    role: req.session.role,
    admin_id: req.session.admin_id,
    username: req.session.username,
    telephone: req.session.telephone,
    fullName: `${req.session.firstname} ${req.session.lastname}`,
    message: req.flash("flashMessage")
  };

  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  let ro = req.body.role;
  let pw = req.body.password;

  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && 
    em.length != 0 && ro.length != 0 && pw.length != 0) {
    if(te.length >= 10) {
      // Regular Expression for strong password validation
      let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
      if(regex.test(pw)==true) {
        let sqlTelValid = "SELECT COUNT(*) AS valid_count FROM admin WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"'";
        con.query(sqlTelValid, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.render("admin/account/register", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
              fn, ln, un, gd, te, em, ro, pw
            })
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count == 0) {

            // Hashing Password
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPass = bcrypt.hashSync(pw, salt)

            let adminData = {
              firstname: fn, lastname: ln, username: un, gender: gd, 
              telephone: te, email: em, role: ro, password: hashedPass,
            }

            con.query('INSERT INTO `admin` SET ?', adminData, (err, result) => {
              if(!err) {
                res.redirect('/panel/admins');
              }
            })
          } else {
            req.flash("fmessage", "Your Username, Email or Phone No. has been used!");
            res.render("admin/account/register", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
              fn, ln, un, gd, te, em, ro, pw
            })
          }
        });
      } else {
        req.flash("fmessage", "Password should contain number, letters & over 8 characters");
        res.render("admin/account/register", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
          fn, ln, un, gd, te, em, ro, pw
        })
      }
    } else {
      req.flash("fmessage", "Phone number cannot go below 10 numbers!");
      res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, pw
    });
    }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, pw
    });
  }
})


// 08. Retrieve all system users.
router.get("/admins", (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    con.query("SELECT * FROM admin", (error, rows) => {
      let internals = {
        title: "All PSF admins",
        admin_id: req.session.admin_id,
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


// 09. Change admin status to 'Inactive'
router.get('/deactivate/(:theId)', (req, res) => {
    let id = req.params.theId;
    let sql = "UPDATE admin SET status = ? WHERE admin_id = ?";
    con.query(sql, ['Inactive', id], (error, result, fields) => {
        if(error) {
            req.flash('flashError', "Cannot change the status");
            res.redirect('/panel/admins');
        } else {
            req.flash('success', "Admin status chenged to Inactive!");
            res.redirect('/panel/admins');
        } 
    })
})

// 10. Change admin status to 'Active'
router.get('/activate/(:theId)', (req, res) => {
  let id = req.params.theId;
  let sql = "UPDATE admin SET status = ? WHERE admin_id = ?";
  con.query(sql, ['Active', id], (error, result, fields) => {
      if(error) {
          req.flash('flashError', "Cannot change the status");
          res.redirect('/panel/admins');
      } else {
          req.flash('success', "Admin status chenged to Inactive!");
          res.redirect('/panel/admins');
      } 
  })
})



// 11. Edit published posts view:
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;
  let sql = `SELECT * FROM admin WHERE admin_id= ${id}`;
  con.query(sql, (err, rows, fields) => {
    if (err) throw err;
    const internals = {
      title: `Update ${rows[0].firstname}'s info`,
      admin_id: rows[0].admin_id,
      firstname: rows[0].firstname,
      lastname: rows[0].lastname,
      username: rows[0].username,
      gender: rows[0].gender,
      telephone: rows[0].telephone,
      email: rows[0].email,
      role: rows[0].role,
      has3RouteSegments: true,
    };

    if (rows.length <= 0) {
      req.flash("error", `Admin not found id ${id}`);
      res.redirect("/panel/admins");
    } else {
      res.render("admin/account/edit-profile", {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash("fmessage"),
      });
    }
  });
});


// 12. Update admin profile 
router.post('/update-admin/(:id)', (req, res) => {
  let id = req.params.id;
  let internals = {
    title: "Update this admin",
    breadcrumbL1: "Admin",
    breadcrumbL2: "Registration",
    role: req.session.role,
    admin_id: req.session.admin_id,
    username: req.session.username,
    telephone: req.session.telephone,
    fullName: `${req.session.firstname} ${req.session.lastname}`,
    message: req.flash("flashMessage")
  };

  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  let ro = req.body.role;

  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && 
    em.length != 0 && ro.length != 0) {
    if(te.length >= 10) {
        let sqlTelValid = "SELECT COUNT(*) AS valid_count FROM admin WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"' ";
        con.query(sqlTelValid, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.redirect(`/panel/edit/${id}`);
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count == 0 || results[0].valid_count > 0) {
            con.query('UPDATE admin SET firstname = ?, lastname = ?, username = ?, gender = ?, telephone = ?, email = ?, role = ? WHERE admin_id = ?', [fn, ln, un, gd, te, em, ro, id], (err, result) => {
              if(!err) {
                res.redirect('/panel/admins');
              }
            })
          } else {
            req.flash("fmessage", "Your Username, Email or Phone No. has been used!");
            res.redirect(`/panel/edit/${id}`);
          }
        });
    } else {
      req.flash("fmessage", "Phone number cannot go below 10 numbers!");
      res.redirect(`/panel/edit/${id}`);
    }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.redirect(`/panel/edit/${id}`);
  }
});


// 13. Admin dashboard view
router.get('/profile', (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    let id = req.session.admin_id;
    let sql5 = `SELECT * FROM admin WHERE admin_id= ${id}`;
    con.query(sql5, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `View your profile (${rows[0].firstname})`,
        admin_id: id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        username: rows[0].username,
        gender: rows[0].gender,
        telephone: rows[0].telephone,
        email: rows[0].email,
        status: rows[0].status,
        has3RouteSegments: true,
      };

      res.render("admin/account/profile", {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash("fmessage"),
      });
    })
  } else {
    // Please get back here and login
    req.flash("flashError", "Please login to view your profile!");
    res.redirect("/panel/login");
  }
});


// 14. Update admin profile 
router.post('/update-self/(:id)', (req, res) => {
  let id = req.params.id;
  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && em.length != 0) {
    if(te.length >= 10) {
      let sqlTel = "SELECT COUNT(*) AS valid_count FROM admin WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"' ";
        con.query(sqlTel, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.redirect(`/panel/profile`);
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count > 0) {
            con.query('UPDATE admin SET firstname = ?, lastname = ?, username = ?, gender = ?, telephone = ?, email = ? WHERE admin_id = ?', [fn, ln, un, gd, te, em, id], (err, result) => {
              if(!err) {
                res.redirect('/panel/dashboard');
              }
            })
          } else {
            req.flash("fmessage", "Your Username, email or phone no. has been used!");
            res.redirect('/panel/profile');
          }
        
        });
    } else {
      req.flash("fmessage", "Phone number cannot go below 10 numbers!");
      res.redirect(`/panel/profile`);
    }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.redirect(`/panel/profile`);
  }
});


// 15. Change password by user ...self
router.get('/change-password', (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    let id = req.session.admin_id;
    let sql5 = `SELECT * FROM admin WHERE admin_id= ${id}`;
    con.query(sql5, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `Change your passoword (${rows[0].firstname})`,
        admin_id: id,
      };

      res.render("admin/account/change-pass", {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash("fmessage"),
      });
    })
  } else {
    // Please get back here and login
    req.flash("flashError", "Please login to view your profile!");
    res.redirect("/panel/login");
  }
});


// 
router.post('/change-password', (req, res) => {
  let oldPass = req.body.old_pass;
  let newPass = req.body.new_pass;
  let admin_id = req.body.admin_id;

  const internals = {
    title: `Change your passoword`,
    admin_id: admin_id,
  };

  if (oldPass.length != 0 && newPass.length != 0 && admin_id.length != 0) {
      // Regular Expression for strong password validation

      let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
      if(regex.test(newPass)==true) {
        let sqlCheck = "SELECT * FROM admin WHERE admin_id='"+admin_id+"' ";
        con.query(sqlCheck, (err, results) => {
        
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.render("admin/account/change-pass", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
            })
          }

          // If no tel|email already exist add sh**
          if(bcrypt.compareSync(oldPass, results[0].password)) {
            // Hashing Password
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPass = bcrypt.hashSync(newPass, salt);

            con.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hashedPass, admin_id], (err, result) => {
              if(!err) {
                res.redirect('/panel/profile');
              }
            })
          } else {
            req.flash("fmessage", "Your old password is incorrect!");
            res.render("admin/account/change-pass", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
            })
          }
        });
      } else {
        req.flash("fmessage", "Password should contain number, letters & over 8 characters");
        res.render("admin/account/change-pass", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        })
      }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.render("admin/account/change-pass", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
    });
  }
})


// Export this router
module.exports = router;