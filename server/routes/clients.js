/**********************************
This page shows all the routes for the
clients who interacts with website
***********************************/
const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const con = require("../config/database");
const fun = require("../config/functions");
const moment = require('moment/moment');

// To be able to send flash...
const flash = require('express-flash');

router.use(flash())


// Home page
router.get(['', '/home'], (req, res) => {
    const internals = {
        title: "Home page",
        description: "Welcome official website for PSF Rwanda",
        hasFullFooter: true,
    }
    res.render('clients/home', { internals });
});

// Routes for for about us
router.get('/background', (req, res) => {
    const internals = {
        title: "Our Background",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/background', { internals });
});

router.get('/psf-25', (req, res) => {
    const internals = {
        title: "PSF 25",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/psf-25', { internals });
});

router.get('/strategies', (req, res) => {
    const internals = {
        title: "Strategies",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/strategies', { internals });
});

router.get('/psf-business-in-rwanda', (req, res) => {
    const internals = {
        title: "Doing Business in Rwanda",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/psf-business', { internals });
});



// Routes for Membership
router.get('/association', (req, res) => {
    const internals = {
        title: "Clusters - Association",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/membership/assoc', { internals });
});

router.get('/golden-circle', (req, res) => {
    const internals = {
        title: "Golden Circle",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/membership/golden-circle', { internals });
});

router.get('/regular', (req, res) => {
    const internals = {
        title: "Regular",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/membership/regular', { internals });
});



// Routes for Events
router.get('/exhibitions', (req, res) => {
    const internals = {
        title: "Events - Exhibitions",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/events/exhibitions', { internals });
});

router.get('/gbf', (req, res) => {
    const internals = {
        title: "Events - GBF",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/events/gbf', { internals });
});



// Routes for Teams
router.get('/team-board', (req, res) => {
    const internals = {
        title: "PSF Board",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/teams/board', { internals });
});

router.get('/team-management', (req, res) => {
    const internals = {
        title: "PSF Management Team",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/teams/management', { internals });
});

router.get('/team-staff', (req, res) => {
    const internals = {
        title: "PSF Staff",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/teams/staff', { internals });
});


// Routes for Media
router.get('/press', (req, res) => {
    con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.role FROM posts po LEFT JOIN admin ad ON ad.admin_id = po.post_author ORDER BY po.post_date DESC LIMIT 12", (error, rows) => {
        let internals = {
            title: "All recent press Releases",
            description: "",
            hasFullFooter: true,
            has3RouteSegments: false,
            data: rows,
            funs: fun, // 2use fx in ejs
            moment: moment
        };

        if (!error) {
            // @gadira
            res.render("clients/media/press-release", { internals });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("clients/media/press-release", { internals });
        }
    });
});


router.get('/gallery', (req, res) => {
    con.query("SELECT * FROM gallery ORDER BY created_at DESC LIMIT 18", (error, rows) => {
        let internals = {
            title: "All recent images from PSF gallery",
            description: "",
            hasFullFooter: true,
            has3RouteSegments: false,
            data: rows,
            funs: fun, // 2use fx in ejs
            moment: moment
        };

        if (!error) {
            // @gadira
            res.render("clients/media/gallery", { internals });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("clients/media/gallery", { internals });
        }
    });
});


// Media (Publication fetch)
router.get('/publications', (req, res) => {
    
    con.query("SELECT * FROM publication ORDER BY pub_date DESC", (error, rows) => {
        const internals = {
            title : "View all publications",
            description: "",
            hasFullFooter: true,
            adminId: req.session.adminId,
            username: req.session.username,
            telephone: req.session.telephone,
            data: rows
        }
        res.render('clients/media/publicas', { internals });
    });
});


// Routes (Misc.)
router.get('/services', (req, res) => {
    const internals = {
        title: "Services",
        description: "PSF Offers various services including Advocacy, Membership, Market linkage, IBI...",
        hasFullFooter: true,
    }
    res.render('clients/services/index', { internals });
});

router.get('/contact', (req, res) => {
    const internals = {
        title: "Contact Us ",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/contact', { internals });
});

router.get('/support', (req, res) => {
    const internals = {
        title: "Suppport/FAQs ",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/about/support', { internals });
});

// Membership benefits page:
router.get('/membership-benefits', (req, res) => {
    const internals = {
        title: "PSF Membership Benefits",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/membership/benefits', { internals });
});

// Member Join page
router.get('/join', (req, res) => {
    const internals = {
        title: "Join Membership",
        description: "",
        hasFullFooter: true,
    }
    res.render('clients/membership/join', { internals });
});



// Export this router
module.exports = router;
