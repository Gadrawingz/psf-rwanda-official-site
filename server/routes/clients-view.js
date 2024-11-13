/**********************************
This page shows all the routes for the
clients who interacts with website
***********************************/
const express = require('express')
const multer = require('multer')
const stripTags = require('striptags')
const router = express.Router()
const con = require("../config/database");
const con2 = require("../config/database2");
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



// 02. Routes for View Single document
router.get("/docs/(:theId)", (req, res) => {
    let theId = req.params.theId;
    con.query("SELECT dc.doc_id, dc.dt_id_ref, dc.doc_title, dc.description, dc.attachment, dc.status, dc.upload_date, dt.dt_id, dt.dt_month, dt.dt_month_no, dt.dt_year, su.firstname, su.lastname, su.role FROM documents dc LEFT JOIN doc_timeline dt ON dt.dt_id=dc.dt_id_ref LEFT JOIN site_users su ON su.user_id = dc.uploader WHERE dc.dt_id_ref='"+theId+"' ORDER BY dc.upload_date DESC", (error, rows) => {

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



// 03. Routes for View single doc. by one
router.get("/read-doc/(:theId)", (req, res) => {
    let theId = req.params.theId;
    con.query("SELECT * FROM documents", (error, rows) => {

        let internals = {
            title: "Read this document",
            description: "",
            hasFullFooter: true,
            has3RouteSegments: true,
            doc_title: rows[0].doc_title,
            attachment: rows[0].attachment
        };

        if (!error) {
            res.render("clients/media/docs-view-full", { internals });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("clients/media/docs-view-full", { internals });
        }
    });
});



// 04. All cruster's view 
router.get('/cluster/(:slug)', async(req, res) => {
    const slug = req.params.slug;
    if(slug) {
        if(slug=='agriculture' || slug=='industry' || slug=='service'|| slug=='trade' || slug=='specialized') {
            // On everything is successful
            con.query("SELECT * FROM clusters WHERE cluster_slug='"+slug+"' ORDER BY cluster_name ASC", (error, rows) => {
                let internals = {
                    title: `${rows[0].cluster_name}'s info`,
                    description: `${rows[0].description}`,
                    hasFullFooter: true,
                    has3RouteSegments: true,
                    stripTags: stripTags
                };

                if (!error) {
                    // Return associations
                    let clusterName = `${rows[0].cluster_name}`;
                    con.query("SELECT * FROM associations WHERE cluster_name='"+clusterName+"' ORDER BY cluster_name ASC", async (error2, rows2) => {
                        res.render("clients/membership/clusters", { data: rows2, internals });
                    });
                } else {
                    console.log("There is internal error occured");
                }
            });
        } else {
            // This cluster doesn't exist;
            console.log("This cluster doesn't exist");
        }
    } else {
        // Handle error that page not found
        console.log("This page not found");
    }
});


// Export this router
module.exports = router;