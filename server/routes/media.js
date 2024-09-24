/**********************************
This page shows all the routes related 
to media pages.
***********************************/
const express = require('express')
const multer = require('multer')
const path = require('path')
const sql = require("mysql");
const router = express.Router()
const con = require("../config/database");


// 01. Publish get view
router.get('/publish', (req, res) => {
    const internals = {
        title : "Add new publication",
        description: "",
    }

    res.render('admin/media/add-pub', {
        layout: "./layouts/LAdmin",
        internals,
        message: req.flash('fmessage')
    })
})


// 02. Publish post view
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/media");
    },
    
    filename: function (req, file, cb) {
        cb(null,`media-${Date.now()}${path.extname(file.originalname)}`);
    },
});

let upload1 = multer({ storage: storage })
router.post('/publish', upload1.single('file'), (req, res, next) => {
    const file = req.file;
    const title = req.body.title;
    const description = req.body.description;
    if(file) {
        if(title.length != 0 && description.length != 0) {
            if(file.mimetype==='application/pdf') {
                // IF SUCCESSFUL
                let sql = "INSERT INTO `publication`(`title`, `description2`, `pub_file`) VALUES ('"+title+"', '"+description+"', '"+req.file.filename+"')";
                
                con.query(sql, function(err, result) {
                    if(err) {
                        req.flash('fmessage', 'Error occurred in database!')
                        res.redirect('/media/publish');
                    }
                })
            } else {
                req.flash('fmessage', 'Only PDF documents are allowed!')
                res.redirect('/media/publish');
            }
        } else {
            req.flash('fmessage', 'Please fill all required fields!')
            res.redirect('/media/publish');
        }
    } else {
        req.flash('fmessage', 'Please upload a file!')
        res.redirect('/media/publish');
    }
})


module.exports = router;