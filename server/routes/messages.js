/**********************************
Specific to messages and all related operations
***********************************/
const express = require('express')
const router = express.Router();
const sql = require('mysql')
const con = require('../config/database');
const fun = require("../config/functions");
const e = require('connect-flash');

// 01. Submit messsage with mail package...

// 02. Retrieve messages
// 03. View all images
router.get('/inbox', (req, res) => {
    con.query("SELECT * FROM messages ORDER BY message_date DESC", (error, rows) => {
        const internals = {
            title: `All messages: Inbox()`,
            breadcrumbL1: "Messages",
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
            res.render("admin/messages/view-messages", {
                layout: "./layouts/LAdmin",internals,
                message: "",
            });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("admin/messages/view-messages", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});



// Export this router
module.exports = router;