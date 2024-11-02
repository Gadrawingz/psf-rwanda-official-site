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
router.get(['/', '/inbox'], (req, res) => {
    con.query("SELECT * FROM messages ORDER BY message_date DESC LIMIT 40", (error, rows) => {
        const internals = {
            title: `Latest 40 messages: inbox(${rows.length})`,
            breadcrumbL1: "Messages",
            breadcrumbL2: "All",
            role: req.session.role,
            user_id: req.session.user_id,
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


// 03. Mark message as read
router.get('/mark-read/(:theId)', (req, res) => {
    let id = req.params.theId;
    let sql = "UPDATE messages SET status = ? WHERE message_id = ?";
    con.query(sql, ['Read', id], (error, result, fields) => {
        if(error) {
            req.flash('fmessage', "Cannot change the status");
            res.redirect('/messages/inbox');
        } else {
            req.flash('fmessage', "Message marked as read!");
            res.redirect('/messages/inbox');
        } 
    })
})


// 04. Mark message as unread
router.get('/mark-unread/(:theId)', (req, res) => {
    let id = req.params.theId;
    let sql = "UPDATE messages SET status = ? WHERE message_id = ?";
    con.query(sql, ['Unread', id], (error, result, fields) => {
        if(error) {
            req.flash('fmessage', "Cannot change the status");
            res.redirect('/messages/inbox');
        } else {
            req.flash('fmessage', "Message marked as unread!");
            res.redirect('/messages/inbox');
        } 
    })
})


// Export this router
module.exports = router;