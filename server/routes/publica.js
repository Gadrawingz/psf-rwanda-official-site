/**********************************
This page shows all the routes related 
to publication pages.
***********************************/
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const con = require("../config/database");

// 01. Publish get view
router.get("/add", (req, res) => {
  const internals = {
    title: "Add new publication",
    description: "",
  };

  res.render("admin/publica/add-pub", {
    layout: "./layouts/LAdmin",
    internals,
    message: req.flash("fmessage"),
  });
});

// 02. Publish post view
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/publica");
  },

  filename: function (req, file, cb) {
    cb(null, `pdoc-${Date.now()}${path.extname(file.originalname)}`);
  },
});

let upload1 = multer({ storage: storage });
router.post("/insert", upload1.single("file"), (req, res, next) => {
  let file = req.file;
  let title = req.body.title;
  let description = req.body.description;
  if (file) {
    if (title.length != 0 && description.length != 0) {
      if (file.mimetype === "application/pdf") {
        // IF SUCCESSFUL
        let sql =
          "INSERT INTO `publication`(`title`, `description`, `pub_file`) VALUES ('" +
          title +
          "', '" +
          description +
          "', '" +
          req.file.filename +
          "')";
        con.query(sql, function (err, result) {
          if (err) {
            req.flash("fmessage", "Error occurred in database!");
            res.redirect("/publica/add");
          } else {
            res.redirect("/publica/all"); // When
          }
        });
      } else {
        req.flash("fmessage", "Only PDF documents are allowed!");
        res.redirect("/publica/add");
      }
    } else {
      req.flash("fmessage", "Please fill all required fields!");
      res.redirect("/publica/add");
    }
  } else {
    req.flash("fmessage", "Please upload a file!");
    res.redirect("/publica/add");
  }
});

// 03. View all publications
router.get("/all", (req, res) => {
  con.query(
    "SELECT * FROM publication ORDER BY pub_date DESC",
    (error, rows) => {
      const internals = {
        title: "View all publications",
        adminId: req.session.adminId,
        username: req.session.username,
        telephone: req.session.telephone,
        data: rows,
      };

      if (!error) {
        // @gadira
        res.render("admin/publica/all-publicas", {
          layout: "./layouts/LAdmin",
          internals,
          message: "",
        });
      } else {
        req.flash("fmessage", "There is an error occured");
        res.render("admin/publica/all-publicas", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
        });
      }
    }
  );
});


// 04. Remove publication record
router.get("/delete/(:id)", (req, res) => {
  let id = req.params.id;
  // Get the item to remove
  let sql3 = `SELECT * FROM publication WHERE pub_id = ${id}`;
  con.query(sql3, (err, rows, fields) => {
    if (err) throw err;
    if (rows.length > 0) {
      // Remove the file 1st
      let fs = require("fs");
      let path2file = "public/uploads/publica/" + rows[0].pub_file;
      let newPath44 = "public/uploads/deleted/" + rows[0].pub_file;

      if (fs.existsSync(path2file)) {
        fs.renameSync(path2file, newPath44);
        //fs.unlinkSync(.....);
        let sql4 = `DELETE FROM publication WHERE pub_id = ${id}`;
        con.query(sql4, (error, result) => {
          if (!error) {
            req.flash("fmessage", `The record with ID: ${id} removed!`);
            res.redirect("/publica/all");
          } else {
            req.flash("fmessage", `Cannot remove a record with ID: ${id}!`);
            res.redirect("/publica/all");
          }
        });
      } else {
        req.flash("fmessage", "No file to remove found!");
        res.redirect("/publica/all");
      }
    } else {
      req.flash("error", `Record was not found!`);
      res.redirect("/publica/all");
    }
  });
});

// 05. Edit published document view:
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;
  let sql = `SELECT * FROM publication WHERE pub_id= ${id}`;
  con.query(sql, (err, rows, fields) => {
    if (err) throw err;
    const internals = {
      title: "Update existing publication",
      pub_id: rows[0].pub_id,
      p_title: rows[0].title,
      p_description: rows[0].description,
      has3RouteSegments: true,
    };
    if (rows.length <= 0) {
      req.flash("error", `Publication not found id ${id}`);
      res.redirect("/users");
    } else {
      res.render("admin/publica/edit-pub", {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash("fmessage"),
      });
    }
  });
});


// 06. Post:Edit Publications
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let description = req.body.description;
  
  if (title.length != 0 && description.length != 0) {
    // IF SUCCESSFUL
    let upData = { title: title, description: description };
    let sql = `UPDATE publication SET ? WHERE pub_id=${id}`;
    con.query(sql, upData, (err, result) => {
      if (err) {
        let sql3 = `SELECT * FROM publication WHERE pub_id= ${id}`;
        con.query(sql3, (err, rows, fields) => {
            if (err) throw err;
            let internals = {
                title: "Update existing publication",
                pub_id: rows[0].pub_id,
                p_title: rows[0].title,
                p_description: rows[0].description,
                has3RouteSegments: true,
            };
            
            req.flash("fmessage", "Error occurred in database!");
            res.render("admin/publica/edit-pub", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        });
      } else {
        res.redirect("/publica/all");
      }
    });
  } else {
    let sql3 = `SELECT * FROM publication WHERE pub_id= ${id}`;
    con.query(sql3, (err, rows, fields) => {
        if (err) throw err;
        let internals = {
            title: "Update existing publication",
            pub_id: rows[0].pub_id,
            p_title: rows[0].title,
            p_description: rows[0].description,
            has3RouteSegments: true,
        };
            
        req.flash("fmessage", "Please fill all required fields!");
        res.render("admin/publica/edit-pub", {
            layout: "./layouts/LAdmin",
            internals,
            message: req.flash("fmessage"),
        });
    });
  }
});



// Export this...
module.exports = router;