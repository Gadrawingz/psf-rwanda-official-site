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
    limits: { fileSize: (1024 * 1024) * 5 }, // size is limited to 5MB
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
                    // let fs = require("fs");
                    // let path2file = "public/uploads/gallery/" + rows[0].pub_file;
                    // if (fs.existsSync(path2file)) {
                    //    fs.unlinkSync(path2file);
                    //} 
                    // Then handle dashboard dynamic data             
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



// Export this stuff
module.exports = router;