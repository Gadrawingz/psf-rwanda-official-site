/**********************************
All for the page to upload all documents, and
This page will use: layout: 'layouts/LAccess'
***********************************/
const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const multer = require("multer");
const path = require('path')
const moment = require('moment/moment');
const con = require("../config/database");
const con2 = require("../config/database2");
const fun = require("../config/functions");
const flash = require("express-flash");
router.use(flash());



// 01. Add documents (route)
router.get("/add", (req, res) => {
  if (req.session.in_user && req.session.in_user.role == 'Admin') {
    con.query("SELECT * FROM `doc_timeline` ORDER BY dt_year DESC", (error, rows) => {
      const internals = {
        title: "Upload new document",
        breadcrumbL1: "Documents",
        breadcrumbL2: "New",
        role: req.session.role,
        user_id: req.session.user_id,
        username: req.session.username,
        telephone: req.session.telephone,
        fullName: `${req.session.firstname} ${req.session.lastname}`,
        yearsData: rows
      };

      let year_month, doc_title, attachment, description = '';

      res.render("admin/docs/add-docs", {
          layout: "./layouts/LAdmin",
          internals,
          message: req.flash("fmessage"),
          year_month, doc_title, attachment, description
      });
    });
  } else {
    req.flash("flashError", "Login to register user!");
    res.redirect("/panel/login");
  }
});


// A. Configure storage engine and filename
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "public/uploads/docs");
  },
  filename: function (req, file, cb) {
      cb(null, `docs-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// B. Custom function to check the file type
function imageCheckFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp|doc|docx|html|odt|pdf|xls|xlsx|ppt|pptx|txt|ods/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
      return cb(null, true);
  } else {
      cb('File type is not supported');
  }
}
// C. Add file type validation
const upload4document = multer({
  storage: imageStorage,
  limits: { fileSize: (1024 * 1024) * 10 }, // size is limited to 10 MB
  fileFilter: (req, file, cb) => {
    imageCheckFileType(file, cb);
  }
}).single('attachment');


router.post('/insert', (req, res) => {
  upload4document(req, res, (err) => {
    let Ymonth = req.body.year_month;
    let Dtitle = req.body.doc_title;
    let Describe = req.body.description;
    let userId = req.session.in_user.user_id;

    if (Dtitle.length != 0 && Ymonth.length != 0 && Describe.length != 0 && userId.length != 0) {
      
      // If SUCCESS
      if (req.file) {
        let sqlDoc ="INSERT INTO `documents`(`dt_id_ref`, `doc_title`, `description`, `attachment`, `uploader`) VALUES ('"+Ymonth+"', '"+fun.addSlashes(Dtitle)+"', '"+fun.addSlashes(Describe)+"', '"+req.file.filename+"', '"+userId+"')";

        con.query(sqlDoc, function (error, results) {
          if (error) {
            req.flash("fmessage", "Error occurred in database!");
            res.redirect("/documents/add");
          } else {
            res.redirect("/documents/all");
          }
        });
      } else {
        req.flash("fmessage", "Try to upload a document!");
        res.redirect(`/documents/add`);
      }
    } else {
      req.flash("fmessage", "All fields must be filled!");
      res.redirect(`/documents/add`);
    }
  })
});


// 03. View all uploaded documents
router.get('/all', (req, res) => {
  if (req.session.in_user && req.session.in_user != undefined) {
    con.query("SELECT dc.doc_id, dc.dt_id_ref, dc.doc_title, dc.description, dc.attachment, dc.status, dc.upload_date, su.firstname, su.lastname, su.telephone, su.position, su.role FROM documents dc LEFT JOIN site_users su ON su.user_id=dc.uploader ORDER BY created_at DESC", (error, rows) => {
        const internals = {
            title: "View all uploaded documents",
            breadcrumbL1: "Documents",
            breadcrumbL2: "All",
            inUser: req.session.in_user,
            data: rows,
            funs: fun,
            moment: moment,
        };
        
        if (!error) {
            res.render("admin/docs/view-docs", {
                layout: "./layouts/LAdmin",internals,
                message: "",
            });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("admin/docs/view-docs", {
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



// Export this router
module.exports = router;
