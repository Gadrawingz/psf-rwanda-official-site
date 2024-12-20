/**********************************
This page shows all the routes specific to accounts, 
registration, app dashboard, login and authentication
This page will use: layout: 'layouts/LAccess'
***********************************/
const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const multer = require("multer");
const moment = require("moment");
const path = require('path')
const con = require("../config/database");
const con2 = require("../config/database2");
const fun = require("../config/functions");

// To be able to send flash
const flash = require("express-flash");
const session = require("express-session");
router.use(flash());

// 01. Forgot user password view
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


// 02. Forgot User post
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
  let role = req.body.user_role;
  let password = req.body.password;

  if (email.length!=0 && role.length!=0 && password.length!=0) {
    con.query('SELECT * FROM site_users WHERE email = ? AND role = ?', [email, role], (error, results, fields) => {
      if (error) {
        req.flash("flashError", "Internal Error (in the system)!");
        res.redirect("/panel/login");
      }

      if(results.length > 0) {
        let match = bcrypt.compareSync(password, results[0].password);
        if(match==true) {
          if(results[0].status=='Active') {  
            // If everything is okay, initialize session
            req.session.in_user = { 
              loggedin : true,
              inFromOutSite: false,
              role: results[0].role,
              user_id: results[0].user_id, 
              position: results[0].position,
              username: results[0].username,
              firstname: results[0].firstname,
              lastname: results[0].lastname 
            };

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
router.get(["", "/dashboard"], async (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    try {
      // Fetching all necessary counts
      let publiCount = await con2.query("SELECT COUNT(*) AS pubs_count FROM `publication`");
      let postsCount = await con2.query("SELECT COUNT(*) AS posts_count FROM `posts`");
      let galleryCount = await con2.query("SELECT COUNT(*) AS gallery_count FROM `gallery`");
      let eventsCount = await con2.query("SELECT COUNT(*) AS events_count FROM `events` WHERE is_happened=0");
      let appManagers = await con2.query("SELECT COUNT(*) AS users_count FROM `site_users`");

      const internals = {
        title: "Dashboard Page",
        breadcrumbL1: "Dashboard",
        breadcrumbL2: "Home",
        inUser: req.session.in_user,  
        // Main 4 counts to be taken
        publicationsNum : publiCount,
        postsNumber : postsCount,
        eventsNumber : eventsCount,
        allUsersNumber: appManagers
      };

      res.render("admin/dashboard", { 
        layout: "./layouts/LAdmin", 
        internals
      });

    } catch (error) {
      console.log("ERROR:"+error);
    }
  } else {
    req.flash("flashError", "Please login to access dashboard!");
    res.redirect("/panel/login");
  }
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

// 07. Register a new user
router.get("/register", (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    const internals = {
      title: "Register new sytem user",
      breadcrumbL1: "Admin",
      breadcrumbL2: "Registration",
      inUser: req.session.in_user,
    };

    // On insert form 1, no data on value to be there!
    let fn, ln, un, gd, te, em, ro, pw, po = ''; 
    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, pw, po
    });
  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});


// 07.B. POST register user
router.post('/register-user', (req, res) => {
  let internals = {
    title: "Register new user",
    breadcrumbL1: "Admin",
    breadcrumbL2: "Registration",
    inUser: req.session.in_user,
    message: req.flash("flashMessage")
  };

  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  let ro = req.body.role;
  let po = req.body.position;
  let pw = req.body.password;

  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && 
    em.length != 0 && ro.length != 0 && po.length != 0 && pw.length != 0) {
    if(te.length >= 10) {
      // Regular Expression for strong password validation
      let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
      if(regex.test(pw)==true) {
        let sqlTelValid = "SELECT COUNT(*) AS valid_count FROM site_users WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"'";
        con.query(sqlTelValid, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.render("admin/account/register", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
              fn, ln, un, gd, te, em, ro, po, pw
            })
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count == 0) {

            // Hashing Password
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPass = bcrypt.hashSync(pw, salt)

            let userData = {
              firstname: fn, lastname: ln, username: un, gender: gd, 
              telephone: te, email: em, role: ro, position: po, password: hashedPass,
            }

            con.query('INSERT INTO `site_users` SET ?', userData, async (err, result) => {
              if(!err) {

                // ADD BASIC INFO IN 'users_info' TABLE
                let lastUser = await con2.query(`SELECT user_id, created_at FROM site_users WHERE email='${em}'`)
                let formattedDate = moment(lastUser[0][0].created_at).format('YYYY-MM-DD HH:mm:ss');
                await con2.query(`INSERT INTO users_info (staff_id, department, profile_pic, biography, position_abbrev, twitter_link, linkedin_link, modified_at) VALUES (${lastUser[0][0].user_id}, 'NONE', '', '', '', '', '', '${formattedDate}')`);
                res.redirect('/panel/users');
              }
            })
          } else {
            req.flash("fmessage", "Your Username, Email or Phone No. has been used!");
            res.render("admin/account/register", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
              fn, ln, un, gd, te, em, ro, po, pw
            })
          }
        });
      } else {
        req.flash("fmessage", "Password should contain number, letters & over 8 characters");
        res.render("admin/account/register", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
          fn, ln, un, gd, te, em, ro, po, pw
        })
      }
    } else {
      req.flash("fmessage", "Phone number cannot go below 10 numbers!");
      res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, po, pw
    });
    }
  } else {
    req.flash("fmessage", "Please fill all required fields!");
    res.render("admin/account/register", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      fn, ln, un, gd, te, em, ro, po, pw
    });
  }
})


// 08. Retrieve all system users.
router.get("/users", (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    con.query("SELECT * FROM site_users", (error, rows) => {
      let internals = {
        title: "All PSF users",
        inUser: req.session.in_user,
        data: rows, // selected ones
      };
      
      if (!error) {
        res.render("admin/account/users", {
          layout: "./layouts/LAdmin",
          internals,
          message: "",
        });
      } else {
        req.flash("flashError", "No data available");
        res.render("admin/account/users", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "Login to view users");
    res.redirect("/panel/login");
  }
});


// 09. Change user status to 'Inactive'
router.get('/deactivate/(:theId)', (req, res) => {
  if (req.session.in_user && req.session.in_user.role == 'Admin') {
    let id = req.params.theId;
    let sql = "UPDATE site_users SET status = ? WHERE user_id = ?";
    con.query(sql, ['Inactive', id], (error, result, fields) => {
        if(error) {
            req.flash('flashError', "Cannot change the status");
            res.redirect('/panel/users');
        } else {
            req.flash('success', "Admin status chenged to Inactive!");
            res.redirect('/panel/users');
        } 
    })
  } else {
    req.flash("flashError", "You need to be admin for de-activation!");
    res.redirect("/panel/login");
  }
})

// 10. Change user status to 'Active'
router.get('/activate/(:theId)', (req, res) => {
  if (req.session.in_user && req.session.in_user.role == 'Admin') {
    let id = req.params.theId;
    let sql = "UPDATE site_users SET status = ? WHERE user_id = ?";
    con.query(sql, ['Active', id], (error, result, fields) => {
        if(error) {
            req.flash('flashError', "Cannot change the status");
            res.redirect('/panel/users');
        } else {
            req.flash('success', "Admin status chenged to Inactive!");
            res.redirect('/panel/users');
        } 
    })
  } else {
    req.flash("flashError", "You need to be admin for activation!");
    res.redirect("/panel/login");
  }
})



// 11. Edit published user:
router.get("/edit/(:id)", (req, res, next) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    let id = req.params.id;
    let sql = `SELECT * FROM site_users WHERE user_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `Update ${rows[0].firstname}'s info`,
        inUser: req.session.in_user,
        user_id: rows[0].user_id,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        username: rows[0].username,
        gender: rows[0].gender,
        telephone: rows[0].telephone,
        email: rows[0].email,
        role: rows[0].role,
        position: rows[0].position,
        has3RouteSegments: true,
      };

      if (rows.length <= 0) {
        req.flash("error", `Admin not found id ${id}`);
        res.redirect("/panel/users");
      } else {
        res.render("admin/account/edit-profile", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "You need to be logged in");
    res.redirect("/panel/login");
  }
});


// 12. Update user profile 
router.post('/update-user/(:id)', (req, res) => {
  let id = req.params.id;
  let internals = {
    title: "Update this User",
    breadcrumbL1: "Admin",
    breadcrumbL2: "Registration",
    inUser: req.session.in_user,
    message: req.flash("flashMessage")
  };

  let fn = req.body.firstname;
  let ln = req.body.lastname;
  let un = req.body.username;
  let gd = req.body.gender;
  let te = req.body.telephone;
  let em = req.body.email;
  let ro = req.body.role;
  let po = req.body.position;

  if (fn.length != 0 && ln.length != 0 && un.length != 0 && gd.length != 0 && te.length != 0 && 
    em.length != 0 && po.length != 0 && ro.length != 0) {
    if(te.length >= 10) {
        let sqlTelValid = "SELECT COUNT(*) AS valid_count FROM site_users WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"' ";
        con.query(sqlTelValid, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.redirect(`/panel/edit/${id}`);
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count == 0 || results[0].valid_count > 0) {
            con.query('UPDATE site_users SET firstname = ?, lastname = ?, username = ?, gender = ?, telephone = ?, email = ?, role = ?, position = ? WHERE user_id = ?', [fn, ln, un, gd, te, em, ro, po, id], (err, result) => {
              if(!err) {
                res.redirect('/panel/users');
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

// PAUSE: X
// 13. Admin dashboard view
router.get('/profile', (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    let id = req.session.user_id;
    let sql5 = `SELECT * FROM site_users WHERE user_id= ${id}`;
    con.query(sql5, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `View your profile (${rows[0].firstname})`,
        user_id: id,
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


// 14. Update User profile 
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
      let sqlTel = "SELECT COUNT(*) AS valid_count FROM site_users WHERE telephone='"+te+"' OR username='"+un+"' OR email='"+em+"' ";
        con.query(sqlTel, (err, results) => {
          if (err) {
            req.flash("fmessage", "Internal Error with DB!");
            res.redirect(`/panel/profile`);
          }

          // If no tel|email already exist add sh**
          if(results[0].valid_count > 0) {
            con.query('UPDATE site_users SET firstname = ?, lastname = ?, username = ?, gender = ?, telephone = ?, email = ? WHERE user_id = ?', [fn, ln, un, gd, te, em, id], (err, result) => {
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
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    let id = req.session.user_id;
    let sql5 = `SELECT * FROM site_users WHERE user_id= ${id}`;
    con.query(sql5, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `Change your passoword (${rows[0].firstname})`,
        user_id: id,
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


// 16. Change pass posting
router.post('/change-password', (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    let oldPass = req.body.old_pass;
    let newPass = req.body.new_pass;
    let user_id = req.body.user_id;

    const internals = {
      title: `Change your passoword`,
      user_id: user_id,
      inUser: req.session.in_user,
    };

    if (oldPass.length != 0 && newPass.length != 0 && user_id.length != 0) {
        // Regular Expression for strong password validation

        let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        if(regex.test(newPass)==true) {
          let sqlCheck = "SELECT * FROM site_users WHERE user_id='"+user_id+"' ";
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

              con.query('UPDATE site_users SET password = ? WHERE user_id = ?', [hashedPass, user_id], (err, result) => {
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
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
})


// 17. Add more info for users
router.get("/add-more/(:id)", (req, res, next) => {
  if (req.session.in_user && req.session.in_user.loggedin == true) {
    let id = req.params.id;
    let sql = `SELECT * FROM site_users us LEFT JOIN users_info ui ON ui.staff_id = us.user_id WHERE us.user_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: `Extra info about (${rows[0].username})`,
        user_id: rows[0].user_id,
        inUser: req.session.in_user,
        has3RouteSegments: true,
      };

      let profile = rows[0].profile_pic;
      let depart = rows[0].department;
      let abbrev = rows[0].position_abbrev;
      let biography = rows[0].biography;
      let tw_link = rows[0].twitter_link;
      let lk_link = rows[0].linkedin_link;

      if (rows.length <= 0) {
        req.flash("error", `Admin not found id ${id}`);
        res.redirect("/panel/users");
      } else {
        res.render("admin/account/add-user-info", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
          profile, depart, abbrev, biography, tw_link, lk_link
        });
      }
    });
  } else {
    req.flash("flashError", "You need to be admin for this role!");
    res.redirect("/panel/login");
  }
});


// A. Configure storage engine and filename
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "public/uploads/profile");
  },
  filename: function (req, file, cb) {
      cb(null, `prof-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// B. Custom function to check the file type
function imageCheckFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
      return cb(null, true);
  } else {
      cb('Image should have jpeg, jpg, png, gif and WebP extensions');
  }
}

// C. Add file type validation
const upload4profile = multer({
  storage: imageStorage,
  limits: { fileSize: (1024 * 1024) * 3 }, // size is limited to 3 MB
  fileFilter: (req, file, cb) => {
    imageCheckFileType(file, cb);
  }
}).single('profile');


// 18. Post user info with image:
router.post('/update-user-info/(:id)', (req, res) => {
  upload4profile(req, res, (err) => {
    let id = req.params.id;
    let dpt = req.body.department;
    let abr = req.body.abbreviation;
    let bio = req.body.biography;
    let tlk = req.body.tw_link;
    let llk = req.body.lk_link;
    let img = req.file.filename;
    //let pex = req.body.profile_exist;
    //forProfile = pex=='true'?req.body.profile:req.file.filename
    
    // Date Handling
    const dt4 = new Date();
    const padLine = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    const finalDate = `${dt4.getFullYear()}-${padLine(dt4.getMonth()+1)}-${padLine(dt4.getDate())} ${padLine(dt4.getHours())}:${padLine(dt4.getMinutes())}:${padLine(dt4.getSeconds())}`;

    if (dpt.length != 0) {
      
      // If SUCCESS...     
      con.query('UPDATE users_info SET department = ?, biography = ?, position_abbrev = ?, twitter_link = ?, linkedin_link = ?, profile_pic = ?, modified_at = ? WHERE staff_id = ?', [dpt, bio, abr, tlk, llk, img, finalDate, id], (err, result) => {
        if(err) {
          req.flash("fmessage", "Internal Error with DB!");
          res.redirect(`/panel/users`);
        } if(!err) {
          res.redirect('/panel/users');
        }
      })
    } else {
      req.flash("fmessage", "Department field cannot be blank!");
      res.redirect(`/panel/profile`);
    }
  })
});




// Export this router
module.exports = router;