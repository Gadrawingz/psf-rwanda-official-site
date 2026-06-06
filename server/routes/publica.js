/**********************************
 T his page shows all the *routes related
 to publication pages.
 ***********************************/
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const con = require("../config/database");
const fs = require("fs"); // File System module for file operations

// --- Multer Configuration ---
const MAX_FILE_SIZE = 20 * 1024 * 1024; // Set max file size to 20MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this directory path is correct and has WRITE permissions!
    cb(null, "public/uploads/publica");
  },

  filename: function (req, file, cb) {
    cb(null, `pdoc-${Date.now()}${path.extname(file.originalname)}`);
  },
});

let upload1 = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});
// --- End Multer Configuration ---

// 01. Publish get view
router.get("/add", (req, res) => {
  const internals = {
    title: "Add new publication",
    inUser: req.session.in_user,
    description: "",
  };

  res.render("admin/publica/add-pub", {
    layout: "./layouts/LAdmin",
    internals,
    message: req.flash("fmessage"),
  });
});

// 02. Publish post view
router.post("/insert", (req, res, next) => {
  // Multer upload logic and error handling
  upload1.single("file")(req, res, (err) => {
    let file = req.file;

    if (err instanceof multer.MulterError) {
      let message = "An upload error occurred!";
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = `File too large! Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
      }
      req.flash("fmessage", message);
      return res.redirect("/publica/add");
    } else if (err) {
      // Log the specific error that is causing "unknown error occurred"
      console.error("Multer/File System Error:", err);
      req.flash("fmessage", "An unknown error occurred during upload. Check server logs for details.");
      return res.redirect("/publica/add");
    }

    // Proceed with validation and database logic
    let title = req.body.title;
    let description = req.body.description;

    if (file) {
      if (title.length != 0 && description.length != 0) {
        if (file.mimetype === "application/pdf") {
          // IF SUCCESSFUL (Security: Using parameterized query)
          let sql =
          "INSERT INTO `publication`(`title`, `description`, `pub_file`) VALUES (?, ?, ?)";
        let values = [title, description, file.filename];

        con.query(sql, values, function (dbErr, result) {
          if (dbErr) {
            console.error("Database INSERT Error:", dbErr);
            // Clean up uploaded file if DB insertion fails
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error("Error cleaning up file:", unlinkErr);
            });
              req.flash("fmessage", "Error occurred in database!");
              res.redirect("/publica/add");
          } else {
            res.redirect("/publica/all");
          }
        });
        } else {
          // Clean up invalid file type
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Error cleaning up file:", unlinkErr);
          });
            req.flash("fmessage", "Only PDF documents are allowed!");
            res.redirect("/publica/add");
        }
      } else {
        // Clean up file if validation fails
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error cleaning up file:", unlinkErr);
        });
          req.flash("fmessage", "Please fill all required fields!");
          res.redirect("/publica/add");
      }
    } else {
      req.flash("fmessage", "Please upload a file!");
      res.redirect("/publica/add");
    }
  });
});


// 03. View all publications
router.get("/all", (req, res) => {
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    con.query(
      "SELECT * FROM publication ORDER BY pub_date DESC",
      (error, rows) => {
        const internals = {
          title: "View all publications",
          inUser: req.session.in_user,
          data: rows,
        };

        if (!error) {
          res.render("admin/publica/all-publicas", {
            layout: "./layouts/LAdmin",
            internals,
            message: "",
          });
        } else {
          console.error("Database SELECT All Error:", error);
          req.flash("fmessage", "There is an error occured");
          res.render("admin/publica/all-publicas", {
            layout: "./layouts/LAdmin",
            internals,
            message: req.flash("fmessage"),
          });
        }
      }
    );
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 04. Remove publication record
router.get("/delete/(:id)", (req, res) => {
  let id = req.params.id;

  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    // Security: Use parameterized query
    let sql3 = `SELECT * FROM publication WHERE pub_id = ?`;
    con.query(sql3, [id], (err, rows, fields) => {
      if (err) throw err;

      if (rows.length > 0) {
        let path2file = "public/uploads/publica/" + rows[0].pub_file;
        let newPath44 = "public/uploads/trash/publica/" + rows[0].pub_file;

        if (fs.existsSync(path2file)) {
          // Rename file (move to trash folder)
          fs.renameSync(path2file, newPath44);

          // Security: Use parameterized query for DELETE
          let sql4 = `DELETE FROM publication WHERE pub_id = ?`;
          con.query(sql4, [id], (error, result) => {
            if (!error) {
              req.flash("fmessage", `The record with ID: ${id} removed!`);
              res.redirect("/publica/all");
            } else {
              console.error("Database DELETE Error:", error);
              req.flash("fmessage", `Cannot remove a record with ID: ${id}!`);
              res.redirect("/publica/all");
            }
          });
        } else {
          req.flash("fmessage", "No file to remove found!");
          res.redirect("/publica/all");
        }
      } else {
        req.flash("fmessage", `Record was not found!`);
        res.redirect("/publica/all");
      }
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 05. Edit published document view:
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (req.session.in_user && (req.session.in_user.loggedin) == true) {
    // Security: Use parameterized query
    let sql = `SELECT * FROM publication WHERE pub_id= ?`;
    con.query(sql, [id], (err, rows, fields) => {
      if (err) throw err;

      if (rows.length <= 0) {
        req.flash("error", `Publication not found id ${id}`);
        return res.redirect("/publica/all"); // Corrected redirect path
      }

      const internals = {
        title: "Update existing publication",
        pub_id: rows[0].pub_id,
        p_title: rows[0].title,
        p_description: rows[0].description,
        has3RouteSegments: true,
      };

      res.render("admin/publica/edit-pub", {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash("fmessage"),
      });
    });
  } else {
    req.flash("flashError", "Login to do your task!");
    res.redirect("/panel/login");
  }
});


// 06. Post:Edit Publications
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let description = req.body.description;

  if (title.length != 0 && description.length != 0) {
    let upData = { title: title, description: description };

    // Security: Use parameterized query for UPDATE
    let sql = `UPDATE publication SET ? WHERE pub_id = ?`;
    con.query(sql, [upData, id], (err, result) => {
      if (err) {
        console.error("Database UPDATE Error:", err);
        // Re-fetch data on error to re-render the edit form
        let sql3 = `SELECT * FROM publication WHERE pub_id= ?`;
        con.query(sql3, [id], (err, rows, fields) => {
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
    // Re-fetch data on validation error to re-render the edit form
    let sql3 = `SELECT * FROM publication WHERE pub_id= ?`;
    con.query(sql3, [id], (err, rows, fields) => {
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
