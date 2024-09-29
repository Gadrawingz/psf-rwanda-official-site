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

// 01.
router.get("/add", (req, res) => {
  if (req.session.loggedin === true && req.session.loggedin != undefined) {
    const internals = {
      title: "Make a new post or press release",
      breadcrumbL1: "Post",
      breadcrumbL2: "New",
      role: req.session.role,
      adminId: req.session.adminId,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
    };

    res.render("admin/posts/add-post", {
      layout: "./layouts/LAdmin",
      internals,
      message: req.flash("fmessage"),
    });
  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});

// 02. Publish post view
const postsImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/posts");
  },

  filename: function (req, file, cb) {
    cb(null, `pimg-${Date.now()}${path.extname(file.originalname)}`);
  },
});

let upload4posts = multer({ storage: postsImageStorage });
router.post("/insert", upload4posts.single("post_image"), (req, res, next) => {
  let file = req.file;
  let post_title = req.body.post_title;
  let post_text = req.body.post_text;
  let post_image = req.file.filename;
  let post_category = req.body.post_category;

  if (file) {
    if (post_title.length >= 5 || post_text.length >= 100) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/png"
      ) {
        // IF SUCCESSFUL
        let sql =
          "INSERT INTO posts(post_title, post_text, post_image, post_author, post_slug, post_category) VALUES ('" +
          post_title +
          "', '" +
          fun.addSlashes(post_text) +
          "', '" +
          post_image +
          "', '" +
          req.session.adminId +
          "', '" +
          "p-"+fun.slugify(post_title) +
          "', '" +
          post_category +
          "')";
        con.query(sql, function (err, result) {
          if (err) {
            req.flash("fmessage", "Error occurred in database!");
            res.redirect("/posts/add");
          } else {
            res.redirect("/posts/all"); // When
          }
        });
      } else {
        req.flash("fmessage", "Only PNG, JPG and WEBP images are allowed!");
        res.redirect("/posts/add");
      }
    } else {
      req.flash("fmessage", "Post title or text is too short!");
      res.redirect("/posts/add");
    }
  } else {
    req.flash("fmessage", "Please upload a file!");
    res.redirect("/posts/add");
  }
});

router.get(["/all"], (req, res) => {
  con.query("SELECT * FROM posts ORDER BY post_date DESC", (error, rows) => {
    const internals = {
      title: "Press Releases (Posts)",
      breadcrumbL1: "Posts",
      breadcrumbL2: "All",
      role: req.session.role,
      adminId: req.session.adminId,
      username: req.session.username,
      telephone: req.session.telephone,
      fullName: `${req.session.firstname} ${req.session.lastname}`,
      data: rows,
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
});


// 04. Remove post record
router.get("/delete/(:id)", (req, res) => {
  let id = req.params.id;
  let sql3 = `SELECT * FROM posts WHERE post_id = ${id}`;
  con.query(sql3, (err, rows, fields) => {
    if (err) throw err;
    if (rows.length > 0) {
      // Remove the file 1st
      let fs = require("fs");
      let path2file = "public/uploads/posts/" + rows[0].post_image;
      let newPath44 = "public/uploads/deleted/" + rows[0].post_image;
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
});


// Export this
module.exports = router;
