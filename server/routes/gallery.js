/**********************************
This file is for gallery operations and routes
As it will use the layout: 'layouts/LAdmin'
***********************************/
const express = require("express");
const multer = require("multer");
const path = require('path')
const router = express.Router();
const con = require("../config/database");
const fun = require("../config/functions");



// 01. Get Gallery view
router.get("/add", (req, res) => {
    if (req.session.loggedin === true && req.session.loggedin != undefined) {
        const internals = {
            title: "Upload new gallery content",
            breadcrumbL1: "Gallery",
            breadcrumbL2: "New",
            role: req.session.role,
            adminId: req.session.adminId,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
        };

        res.render("admin/gallery/add-gallery", {
            layout: "./layouts/LAdmin",
            internals,
            message: req.flash("fmessage"),
        });
    } else {
      req.flash("flashError", "Login to register user!");
      res.redirect("/panel/login");
    }
});


// A. Configure storage engine and filename
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/gallery");
    },

    filename: function (req, file, cb) {
      cb(null, `gr-${Date.now()}${path.extname(file.originalname)}`);
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
const upload4gallery = multer({
    storage: imageStorage,
    limits: { fileSize: (1024 * 1024) * 3 }, // size is limited to 3 MB
    fileFilter: (req, file, cb) => {
        gadCheckFileType(file, cb);
    }
}).single('file_name');


// 02. Handling full gallery insert
router.post("/insert", (req, res) => {
    upload4gallery(req, res, (err) => {
        if(!err) {
            if(req.file) {
                let content_type = req.body.content_type;
                let file_size = req.file.size;
                let file_name = req.file.filename;
                let img_title = req.body.img_title;
                let img_description = req.body.img_description;

                if (img_title.length >= 5 && img_description.length >= 10) {
                    // WHEN ALL IZ WELL
                    let sql ="INSERT INTO gallery (`img_title`, `img_description`, `content_type`, `file_size`, `file_name`) VALUES ('"+fun.addSlashes(img_title)+"', '"+fun.addSlashes(img_description)+"', '" +content_type+"', '"+file_size+"', '" +file_name +"')";
                    con.query(sql, function (err, result) {
                        if (err) {
                            req.flash("fmessage", "Error occurred in database!");
                            res.redirect("/gallery/add");
                        } else {
                            res.redirect("/gallery/all");
                        }
                    });
                } else {
                    req.flash("fmessage", "The title or description is too short!");
                    res.redirect("/gallery/add");
                    // Remove the recent file uploaded.
                    let fs = require("fs");
                    let path2file = "public/uploads/gallery/" + file_name;
                    if (fs.existsSync(path2file)) {
                        fs.unlinkSync(path2file);
                    }           
                }
            } else {
                req.flash("fmessage", "No file uploaded");
                res.redirect("/gallery/add");
            }
        } else {
            req.flash("fmessage", "ERROR: "+err);
            res.redirect("/gallery/add");
        }
    })
});


// 03. View all images
router.get(["/all"], (req, res) => {
    con.query("SELECT * FROM gallery ORDER BY created_at DESC", (error, rows) => {
        const internals = {
            title: "View all gallery items",
            breadcrumbL1: "Gallery",
            breadcrumbL2: "All",
            role: req.session.role,
            adminId: req.session.adminId,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
            data: rows,
            funs: fun,
        };
        
        if (!error) {
            // @gadira
            res.render("admin/gallery/view-gallery", {
                layout: "./layouts/LAdmin",internals,
                message: "",
            });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("admin/gallery/view-gallery", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});


// 04. Remove gallery item
router.get("/delete/(:id)", (req, res) => {
    let id = req.params.id;
    let sql3 = `SELECT * FROM gallery WHERE gallery_id = ${id}`;
    
    con.query(sql3, (err, rows, fields) => {
        if (err) throw err;
        if (rows.length > 0) {
        // Remove the file 1st
        let fs = require("fs");
        let path2file = "public/uploads/gallery/" + rows[0].file_name;
        let newPath44 = "public/uploads/trash/gallery/" + rows[0].file_name;
        if (fs.existsSync(path2file)) {
            fs.renameSync(path2file, newPath44);
            let sql4 = `DELETE FROM gallery WHERE gallery_id = ${id}`;
            con.query(sql4, (error, result) => {
                if (!error) {
                    req.flash("fmessage", `The record with ID: ${id} removed!`);
                    res.redirect("/gallery/all");
                } else {
                    req.flash("fmessage", `Cannot remove a record with ID: ${id}!`);
                    res.redirect("/gallery/all");
                }
            });
        } else {
          req.flash("fmessage", "No file to remove found!");
          res.redirect("/gallery/all");
        }
    } else {
        req.flash("fmessage", `Record was not found!`);
        res.redirect("/gallery/all");
    }
});
});


// 05. Edit gallery item:
router.get("/edit/(:id)", (req, res, next) => {
    let id = req.params.id;
    let sql = `SELECT * FROM gallery WHERE gallery_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
        if (err) throw err;
        const internals = {
            title: "Update this record",
            gallery_id: rows[0].gallery_id,
            img_title: rows[0].img_title,
            img_description: rows[0].img_description,
            has3RouteSegments: true,
        };
        
        if (rows.length <= 0) {
            req.flash("error", `No ID:${id} is found`);
            res.redirect("/gallery/all");
        } else {
            res.render("admin/gallery/edit-gallery", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});


// 06. Update Gallery item, Through POST Method:
router.post("/update/:id", (req, res, next) => {
    let id = req.params.id;
    let img_title = req.body.img_title;
    let img_description = req.body.img_description;
    
    if (img_title.length != 0 && img_description.length != 0) {
      if (img_title.length >= 5 && img_description.length >= 10) {
      // IF OK...
      let upData = { img_title: img_title, img_description: img_description};
      let sql = `UPDATE gallery SET ? WHERE gallery_id=${id}`;
      con.query(sql, upData, (err, result) => {
        if (err) {
          let sql3 = `SELECT * FROM gallery WHERE gallery_id= ${id}`;
          con.query(sql3, (err, rows, fields) => {
              if (err) throw err;
              let internals = {
                  title: "Update existing gallery row",
                  gallery_id: rows[0].gallery_id,
                  img_title: rows[0].img_title,
                  img_description: rows[0].img_description,
                  has3RouteSegments: true,
              };
              
              req.flash("fmessage", "Error occurred in database!");
              res.render("admin/gallery/edit-gallery", {
                  layout: "./layouts/LAdmin",
                  internals,
                  message: req.flash("fmessage"),
              });
          });
        } else {
          res.redirect("/gallery/all");
        }
      });
      } else {
        req.flash("fmessage", "The title or text is too short!");
        res.redirect(`/gallery/edit/${id}`);
      }
    } else {
      let sql3 = `SELECT * FROM gallery WHERE gallery_id= ${id}`;
      con.query(sql3, (err, rows, fields) => {
          if (err) throw err;
          let internals = {
            title: "Update existing gallery row",
            gallery_id: rows[0].gallery_id,
            img_title: rows[0].img_title,
            img_description: rows[0].img_description,
            has3RouteSegments: true,
        };
              
          req.flash("fmessage", "Please fill all required fields!");
          res.render("admin/gallery/edit-gallery", {
              layout: "./layouts/LAdmin",
              internals,
              message: req.flash("fmessage"),
          });
      });
    }
});



// Export this stuff
module.exports = router;