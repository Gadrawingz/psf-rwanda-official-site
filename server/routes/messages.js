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
            inUser: req.session.in_user,
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

    if (req.session.in_user && (req.session.in_user.loggedin) == true) {
        con.query(sql, ['Read', id], (error, result, fields) => {
            if(error) {
                req.flash('fmessage', "Cannot change the status");
                res.redirect('/messages/inbox');
            } else {
                req.flash('fmessage', "Message marked as read!");
                res.redirect('/messages/inbox');
            } 
        })
    } else {
        req.flash("flashError", "Login to do your task!");
        res.redirect("/panel/login");
    }
})


// 04. Mark message as unread
router.get('/mark-unread/(:theId)', (req, res) => {
    let id = req.params.theId;

    if (req.session.in_user && (req.session.in_user.loggedin) == true) {
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
    } else {
        req.flash("flashError", "Login to do your task!");
        res.redirect("/panel/login");
    }
});


// 05. Feedback retrieval
router.get(['/', '/feedback'], (req, res) => {
    con.query("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 40", (error, rows) => {
        const internals = {
            title: `View feedback from users (${rows.length})`,
            breadcrumbL1: "What clients say...",
            breadcrumbL2: "All",
            inUser: req.session.in_user,
            data: rows,
            funs: fun,
        };
        
        if (!error) {
            res.render("admin/messages/view-feedback", {
                layout: "./layouts/LAdmin",internals,
                message: "",
            });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("admin/messages/view-feedback", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});

// 06. Mark feedback to be visible on homepage
router.get('/mark1/(:id)', (req, res) => {
    let id = req.params.id;
    let sql = "UPDATE feedback SET published = ? WHERE fb_id = ?";

    if (req.session.in_user && (req.session.in_user.loggedin) == true) {
        con.query(sql, [1, id], (error, result, fields) => {
            if(error) {
                req.flash('fmessage', "Cannot change item");
                res.redirect('/messages/feedback');
            } else {
                req.flash('fmessage', "Feedback is now visible to homepage!");
                res.redirect('/messages/feedback');
            } 
        })
    } else {
        req.flash("flashError", "Login to do your task!");
        res.redirect("/panel/login");
    }
})

// 07. Mark feedback to be hidden on homepage
router.get('/mark0/(:id)', (req, res) => {
    let id = req.params.id;

    if (req.session.in_user && (req.session.in_user.loggedin) == true) {
        let sql = "UPDATE feedback SET published = ? WHERE fb_id = ?";
        con.query(sql, [0, id], (error, result, fields) => {
            if(error) {
                req.flash('fmessage', "Cannot change the status");
                res.redirect('/messages/feedback');
            } else {
                req.flash('fmessage', "Feedback hidden from homepage!");
                res.redirect('/messages/feedback');
            } 
        })
    } else {
        req.flash("flashError", "Login to do your task!");
        res.redirect("/panel/login");
    }
});


// Export this router
module.exports = router;