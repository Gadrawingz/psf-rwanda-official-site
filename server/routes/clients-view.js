/**********************************
This page shows all the routes for the
clients who interacts with website
***********************************/
const express = require('express')
const multer = require('multer')
const stripTags = require('striptags')
const router = express.Router()
const con = require("../config/database");
const fun = require("../config/functions");
const moment = require('moment/moment');

// 01. Routes for View Single post
router.get("/post/(:slug)", (req, res) => {
    let slug = req.params.slug;
    con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.firstname AS author_fn, ad.lastname AS author_ln, ad.gender, ad.role FROM posts po LEFT JOIN site_users ad ON ad.user_id = po.post_author WHERE po.post_slug='" + slug + "'", (error, rows) => {

        // Inside, We fetch all related posts but limited to 8
        con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.role FROM posts po LEFT JOIN site_users ad ON ad.user_id = po.post_author ORDER BY po.post_title ASC LIMIT 8", (error2, rows2) => {
            let internals = {
                title: rows[0].post_title,
                description: "",
                hasFullFooter: true,
                has3RouteSegments: true,
                data: rows,
                asideData: rows2,
                stripTags: stripTags,
                funs: fun, // 2use fx in ejs
                moment: moment,
            };

            if (!error) {
                // @gadira
                res.render("clients/media/post-view", { internals });
            } else {
                req.flash("fmessage", "There is an error occured");
                res.render("clients/media/post-view", { internals });
            }
        });
    });
});


// 01. Routes for View Single post
router.get("/docs/(:theId)", (req, res) => {
    let theId = req.params.theId;
    con.query("SELECT dc.doc_id, dc.dt_id_ref, dc.doc_title, dc.description, dc.attachment, dc.status, dc.upload_date, dt.dt_id, dt.dt_month, dt.dt_month_no, dt.dt_year, su.firstname, su.lastname, su.role FROM documents dc LEFT JOIN doc_timeline dt ON dt.dt_id=dc.dt_id_ref LEFT JOIN site_users su ON su.user_id = dc.uploader WHERE dc.dt_id_ref='"+theId+"' ORDER BY dc.upload_date DESC; ", (error, rows) => {

        let internals = {
            title: "View Documents",
            description: "",
            hasFullFooter: true,
            has3RouteSegments: true,
            data: rows,
            stripTags: stripTags,
            funs: fun, // 2use fx in ejs
            moment: moment,
        };

        if (!error) {
            res.render("clients/media/docs-view-monthly", { internals });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("clients/media/docs-view-monthly", { internals });
        }
    });
});



// Export this router
module.exports = router;