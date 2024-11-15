/**********************************
This page shows all the routes specific to posts
This page will use: layout: 'layouts/LAdmin'
***********************************/

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const con = require("../config/database");
const fun = require("../config/functions");
const moment = require('moment/moment');


// 01.
router.get("/add", (req, res) => {
  if (req.session.in_user && req.session.in_user != undefined) {
    
    const internals = {
      title: "Make a new post (press release)",
      breadcrumbL1: "Post",
      breadcrumbL2: "New",
      inUser: req.session.in_user,
      funs: fun,
      moment: moment,
    };

    res.render("admin/posts/add-post", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
      post_title:"", post_text: "", post_category:""
    });

  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});

// 02. Publish post view
// A. Configure storage engine and filename
const postsImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/posts");
  },

  filename: function (req, file, cb) {
    cb(null, `pimg-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// B. Custom function to check the file type
function gadCheckFileType(file, cb) {
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
const upload4posts = multer({
  storage: postsImageStorage,
  limits: { fileSize: (1024 * 1024) * 5 }, // size is limited to 5 MB
  fileFilter: (req, file, cb) => {
      gadCheckFileType(file, cb);
  }
}).single('post_image');

router.post("/insert", (req, res) => {
  upload4posts(req, res, (err) => {
    let post_title = fun.addSlashes(req.body.post_title);
    let post_text = fun.addSlashes(req.body.post_text);
    let post_image = req.file.filename;
    let post_category = req.body.post_category;

    const internals = {
      title: "Make a post (Press Release)",
      breadcrumbL1: "Post",
      breadcrumbL2: "New",
      inUser: req.session.in_user,
      funs: fun
    };

      if (!err) {
          if (post_title.length != 0 && post_text.length != 0 && post_category.length != 0) {
              if (req.file) {
                  if (post_title.length >= 10 && post_text.length >= 100) {
                      // ON SUCCESSFUL ACTS
                      let postsData = {
                        post_title: fun.addSlashes(post_title),
                        post_text: fun.addSlashes(post_text),
                        post_image: post_image,
                        post_author: req.session.user_id,
                        post_slug: "p-"+fun.slugify(post_title),
                        post_category: post_category
                      };

                      con.query("INSERT INTO posts SET ?", postsData, (err, results, fields) => {
                          if (err) {
                              req.flash("fmessage", "Error occurred in database!");
                              res.render("admin/posts/add-post", {
                                  layout: "./layouts/LAdmin",
                                  internals,
                                  message: req.flash("fmessage"),
                                  post_title, post_text, post_category
                              })
                          } else {
                            res.redirect("/posts/all");
                          }
                      });
                  } else {
                      req.flash("fmessage", "The title or description is too short!");
                      res.render("admin/posts/add-post", {
                          layout: "./layouts/LAdmin",
                          internals,
                          message: req.flash("fmessage"),
                          post_title, post_text, post_category
                      })
                      let fs = require("fs");
                      let path2file = "public/uploads/posts/" + post_image;
                      if (fs.existsSync(path2file)) {
                          fs.unlinkSync(path2file);
                      }
                  }
              } else {
                  req.flash("fmessage", "No file uploaded");
                  res.render("admin/posts/add-post", {
                      layout: "./layouts/LAdmin",
                      internals,
                      message: req.flash("fmessage"),
                      post_title, post_text, post_category
                  })
              }
          } else {
              req.flash("fmessage", "All fields are required!");
              res.render("admin/posts/add-post", {
                  layout: "./layouts/LAdmin",
                  internals,
                  message: req.flash("fmessage"),
                  post_title, post_text, post_category
              })
          }
      } else {
          req.flash("fmessage", "ERROR: " + err);
          res.render("admin/posts/add-post", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
              post_title, post_text, post_category
          })
      }
  })
});


// 03. View All Posts
router.get(["/all"], (req, res) => {
  if (req.session.in_user && req.session.in_user != undefined) {
    con.query("SELECT * FROM posts ORDER BY post_date DESC", (error, rows) => {
      const internals = {
        title: "Press Releases (Posts)",
        breadcrumbL1: "Posts",
        breadcrumbL2: "All",
        inUser: req.session.in_user,
        data: rows,
        funs: fun,
      };

      if (!error) {
        // @gadira
        res.render("admin/posts/view-posts", {
          layout: "./layouts/LAdmin",
          internals,
          message: "",
        });
      } else {
        req.flash("fmessage", "There is an error occured");
        res.render("admin/posts/view-posts", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 04. Remove post record
router.get("/delete/(:id)", (req, res) => {
  let id = req.params.id;
  if (req.session.in_user && req.session.in_user != undefined) {
    let sql3 = `SELECT * FROM posts WHERE post_id = ${id}`;
    con.query(sql3, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length > 0) {
        // Remove the file 1st
        let fs = require("fs");
        let path2file = "public/uploads/posts/" + rows[0].post_image;
        let newPath44 = "public/uploads/trash/posts/" + rows[0].post_image;
        if (fs.existsSync(path2file)) {
          fs.renameSync(path2file, newPath44);
          let sql4 = `DELETE FROM posts WHERE post_id = ${id}`;
          con.query(sql4, (error, result) => {
            if (!error) {
              req.flash("fmessage", `The record with ID: ${id} removed!`);
              res.redirect("/posts/all");
            } else {
              req.flash("fmessage", `Cannot remove a record with ID: ${id}!`);
              res.redirect("/posts/all");
            }
          });
        } else {
          req.flash("fmessage", "No file to remove found!");
          res.redirect("/posts/all");
        }
      } else {
        req.flash("fmessage", `Record was not found!`);
        res.redirect("/posts/all");
      }
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 05. Edit published posts view:
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (req.session.in_user && req.session.in_user != undefined) {
    let sql = `SELECT * FROM posts WHERE post_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: "Update existing post",
        post_id: rows[0].post_id,
        post_title: rows[0].post_title,
        post_text: rows[0].post_text,
        post_category: rows[0].post_category,
        has3RouteSegments: true,
      };

      if (rows.length <= 0) {
        req.flash("error", `Post not found id ${id}`);
        res.redirect("/posts/all");
      } else {

        res.render("admin/posts/edit-post", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 06. Update Posts, Through POST Method:
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let post_title = req.body.post_title;
  let post_text = req.body.post_text;
  let post_category = req.body.post_category;
  
  if (post_title.length != 0 && post_text.length != 0 && post_category.length != 0) {
    if (post_title.length >= 10 && post_text.length >= 100) {
    // IF SUCCESSFUL
    let upData = { post_title: post_title, post_text: post_text, post_category: post_category };
    let sql = `UPDATE posts SET ? WHERE post_id=${id}`;
    con.query(sql, upData, (err, result) => {
      if (err) {
        let sql3 = `SELECT * FROM posts WHERE post_id= ${id}`;
        con.query(sql3, (err, rows, fields) => {
            if (err) throw err;
            let internals = {
                title: "Update existing post",
                post_id: rows[0].post_id,
                post_title: rows[0].post_title,
                post_text: rows[0].post_text,
                post_category: rows[0].post_category,
                has3RouteSegments: true,
            };
            
            req.flash("fmessage", "Error occurred in database!");
            res.render("admin/posts/edit-post", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        });
      } else {
        res.redirect("/posts/all");
      }
    });
    } else {
      req.flash("fmessage", "Post title or text is too short!");
      res.redirect(`/posts/edit/${id}`);
    }
  } else {
    let sql3 = `SELECT * FROM posts WHERE post_id= ${id}`;
    con.query(sql3, (err, rows, fields) => {
        if (err) throw err;
        let internals = {
          title: "Update existing post",
          post_id: rows[0].post_id,
          post_title: rows[0].post_title,
          post_text: rows[0].post_text,
          post_category: rows[0].post_category,
          has3RouteSegments: true,
      };
            
        req.flash("fmessage", "Please fill all required fields!");
        res.render("admin/publica/edit-post", {
            layout: "./layouts/LAdmin",
            internals,
            message: req.flash("fmessage"),
        });
    });
  }
});


// 07. Get page view to update image:
router.get("/edit-image/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (req.session.in_user && req.session.in_user != undefined) {
    let sql = `SELECT * FROM posts WHERE post_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
      if (err) throw err;
      const internals = {
        title: "Update post image",
        post_id: rows[0].post_id,
        post_image: rows[0].post_image,
        has3RouteSegments: true,
      };

      if (rows.length <= 0) {
        req.flash("error", `Post not found id ${id}`);
        res.redirect("/posts/all");
      } else {

        res.render("admin/posts/edit-post-img", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});

router.post("/update-image/(:id)", (req, res) => {
  let id = req.params.id;
  let post_image = req.file.filename;
  upload4posts(req, res, (err) => {
    if (!err) {
      if (req.file) {
        // ON SUCCESSFUL
        let sql = `UPDATE posts SET post_image ='${post_image}' WHERE post_id=${id}`;
        con.query(sql, (err, result) => {
          if (err) {
            req.flash("fmessage", "Error occurred in database!");
            res.redirect(`/posts/edit/${id}`);
          } else {
            res.redirect("/posts/all");
          }
        });
      } else {
        req.flash("fmessage", "No file uploaded");
        res.redirect(`/posts/edit/${id}`);
      }
    } else {
      req.flash("fmessage", "ERROR: " + err);
      res.redirect(`/posts/edit/${id}`);
    }
  })
});


// Export this
module.exports = router;
