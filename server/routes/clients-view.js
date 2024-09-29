/**********************************
This page shows all the routes for the
clients who interacts with website
***********************************/
const express = require('express')
const multer = require('multer')
const router = express.Router()
const con = require("../config/database");
const fun = require("../config/functions");

// Routes for View Single post
router.get("/post/(:slug)", (req, res) => {
    let slug = req.params.slug;
    con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.firstname AS author_fn, ad.lastname AS author_ln, ad.gender, ad.role FROM posts po LEFT JOIN admin ad ON ad.admin_id = po.post_author WHERE po.post_slug='" + slug + "'", (error, rows) => {

        // Inside, We fetch all related posts but limited to 8
        con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.role FROM posts po LEFT JOIN admin ad ON ad.admin_id = po.post_author ORDER BY po.post_title ASC LIMIT 8", (error2, rows2) => {
            let internals = {
                title: rows[0].post_title,
                description: "",
                hasFullFooter: true,
                has3RouteSegments: true,
                data: rows,
                asideData: rows2
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





// Export this router
module.exports = router;