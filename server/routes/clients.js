/**********************************
This page shows all the routes for the
clients who interacts with website
***********************************/
const express = require('express')
const session = require('express-session');
const multer = require('multer')
const bcrypt = require('bcrypt');
const path = require('path')
const router = express.Router()
const con = require("../config/database");
const con2 = require("../config/database2");
const fun = require("../config/functions");
const moment = require('moment/moment');

// To be able to send flash...
const flash = require('express-flash');
router.use(flash())


// Home page
router.get(['', '/home'], (req, res) => {
    con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.role FROM posts po LEFT JOIN site_users ad ON ad.user_id = po.post_author ORDER BY po.post_date DESC LIMIT 3", (error, rows) => {
        const internals = {
            title: "Home page",
            description: "Welcome official website for PSF Rwanda",
            inUser: req.session.in_user,
            hasFullFooter: true,
            data: rows,
            funs: fun,
            moment: moment,
        }

        if (!error) {
            res.render("clients/home", { internals });
        }
    });
});

// Routes for for about us
router.get('/background', (req, res) => {
    const internals = {
        title: "Our Background",
        description: "",
        inUser: req.session.in_user,
        hasFullFooter: true,
    }

    res.render('clients/about/background', { internals });
});

router.get('/psf-25', (req, res) => {
    const internals = {
        title: "PSF 25",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/about/psf-25', { internals });
});

router.get('/strategies', (req, res) => {
    const internals = {
        title: "Strategies",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/about/strategies', { internals });
});

router.get('/psf-business-in-rwanda', (req, res) => {
    const internals = {
        title: "Doing Business in Rwanda",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/about/psf-business', { internals });
});



// Routes for Membership
router.get('/clusters', (req, res) => {
    const internals = {
        title: "Membership - Clusters",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/clusters', { internals });
});

router.get('/associations', async(req, res) => {
    let internals = {
        title: "Associations per clusters",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
        has3RouteSegments: false,
        funs: fun,
        moment: moment
    };

    try {
        // Fetching data...
        const [infoAgro] = await con2.query(
            "SELECT * FROM associations WHERE cluster_name='Agriculture' ORDER BY association ASC LIMIT 5"
        );
        const [infoTrade] = await con2.query(
            "SELECT * FROM associations WHERE cluster_name='Trade' ORDER BY association ASC LIMIT 5"
        );
        const [infoService] = await con2.query(
            "SELECT * FROM associations WHERE cluster_name='Service' ORDER BY association ASC LIMIT 5"
        );
        const [infoIndustry] = await con2.query(
            "SELECT * FROM associations WHERE cluster_name='Industry' ORDER BY association ASC LIMIT 5"
        );
        const [infoSpecialized] = await con2.query(
            "SELECT * FROM associations WHERE cluster_name='Specialized' ORDER BY association ASC LIMIT 5"
        );

        const combinedData = { 
            tableAgro: infoAgro, tableTrade: infoTrade,
            tableServ: infoService, tableIndu: infoIndustry, tableSpec: infoSpecialized
        };

        res.render('clients/membership/associations', { 
            data: combinedData, internals
        });

    } catch (error) {
        console.log('Server Error: Error with DB');
    }

});

router.get('/golden-circle', (req, res) => {
    const internals = {
        title: "Golden Circle",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/golden-circle', { internals });
});

router.get('/indashyikirwa', (req, res) => {
    const internals = {
        title: "Indashyikirwa",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/indashyikirwa', { internals });
});

router.get('/associate-members', (req, res) => {
    const internals = {
        title: "Associate Members",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/associate', { internals });
});



// Routes for Events
router.get('/exhibitions', (req, res) => {
    con.query("SELECT * FROM events ORDER BY event_id DESC LIMIT 18", (error, rows) => {
        let internals = {
            title: "Events - Exhibitions",
            description: "",
            hasFullFooter: true,
            inUser: req.session.in_user,
            has3RouteSegments: false,
            data: rows,
            funs: fun,
            moment: moment
        };

        if (!error) {
            res.render("clients/events/exhibitions", { internals });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("clients/events/exhibitions", { internals });
        }
    });
});

router.get('/gbf', (req, res) => {
    const internals = {
        title: "Events - GBF",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/events/gbf', { internals });
});

router.get('/ritf-expo', (req, res) => {
    const internals = {
        title: "RITF EXPO",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/events/ritf-expo', { internals });
});


// Routes for Teams
router.get('/team-board', (req, res) => {
    const internals = {
        title: "PSF Board",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/teams/board', { internals });
});

router.get('/team-management', (req, res) => {
    const internals = {
        title: "PSF Management Team",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/teams/management', { internals });
});

router.get('/team-staff', (req, res) => {
    const internals = {
        title: "PSF Staff",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/teams/staff', { internals });
});


// Routes for Media
router.get('/press', (req, res) => {
    con.query("SELECT po.post_title, po.post_slug, po.post_text, po.post_date, po.post_image, po.post_category, ad.role FROM posts po LEFT JOIN site_users ad ON ad.user_id = po.post_author ORDER BY po.post_date DESC LIMIT 12", (error, rows) => {
        let internals = {
            title: "All recent press Releases",
            description: "",
            hasFullFooter: true,
            inUser: req.session.in_user,
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


// X. Gallery 
router.get('/gallery', (req, res) => {
    con.query("SELECT * FROM gallery ORDER BY created_at DESC LIMIT 18", (error, rows) => {
        let internals = {
            title: "All recent images from PSF gallery",
            description: "",
            hasFullFooter: true,
            inUser: req.session.in_user,
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
            inUser: req.session.in_user,
            data: rows
        }
        res.render('clients/media/publicas', { internals });
    });
});


// Media (Public & Private documents)
router.get('/extract-documents', async (req, res) => {
    try {
        const internals = {
            title : "Extract - Documents",
            description: "",
            hasFullFooter: true,
            inUser: req.session.in_user,
            inUserInfo: req.session.in_user,
        }

        // Fetching data from multiple tables
        const [doc2024] = await con2.query("SELECT * FROM doc_timeline WHERE dt_year='2024' ORDER BY dt_id ASC");
        const [doc2025] = await con2.query("SELECT * FROM doc_timeline WHERE dt_year='2025' ORDER BY dt_id ASC");
        // Render data with combined data
        const combinedData = { table24: doc2024, table25: doc2025 };

        // Receive session initialized from login_auth 
        // Here we get: loggedin, role, user_id, username, firstname,...
        const inUser = req.session.in_user;
        res.render('clients/media/extract-docs', { data: combinedData, internals, inUser });
    } catch (error) {
        //console.error('Error executing queries:', error);
        //res.status(500).send('Server Error');
        console.log('Server Error: Error with DB');
    }
});


// Sign-up to view document: GET
router.get('/login-documents', async (req, res) => {
    try {
        const internals = {
            title : "Board member login",
            description: "Enter valid credentials to access board documents...",
            hasFullFooter: true,
            inUser: req.session.in_user,
        }
        const message = req.flash("fmessage"); // To make flash message appear
        res.render('clients/media/login-docs', { internals, message });
    } catch (error) {
        console.log('Server Error: Error with DB');
    }
});


// Sign-up to view document: POST
router.post('/login-documents-auth', (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let loginTime = fun.currentDateTime();

        if(email.length!=0 && password.length!=0) {
            let sqlLogin = "SELECT * FROM site_users WHERE email = ? AND role = 'Lead' ";
            con.query(sqlLogin, [email], (error, results, fields) => {
                if (error) {
                    req.flash("fmessage", `Internal Error (in the system)!`);
                    res.redirect("/login-documents");
                }
                
                // DATA : 01
                if(results.length > 0) {
                    let match = bcrypt.compareSync(password, results[0].password);
                    if(match==true) {
                        if(results[0].status=='Active') {
                            
                            // Initialize session for logged in user
                            req.session.in_user = { 
                                loggedin : true,
                                inFromOutSite: true,
                                role: results[0].role,
                                user_id: results[0].user_id, 
                                username: results[0].username,
                                position: results[0].position, 
                                firstname: results[0].firstname, 
                                lastname: results[0].lastname 
                            };

                            let activeUser = results[0].user_id;
                            res.redirect(`/extract-documents?access_allowed=true&staff=${activeUser}`);
                        } else {
                            req.flash("fmessage", `Oops! This account is not activated!`);
                            res.redirect("/login-documents");
                        }
                    } else {
                        req.flash("fmessage", "Wrong password!");
                        res.redirect("/login-documents");
                    }
                } else {
                    req.flash("fmessage", "Only board members or staff members with permission are allowed!");
                    res.redirect("/login-documents");
                }
            })
        } else {
            req.flash("flashError", "Please fill all required fields!");
            res.redirect("/login-documents");
            res.end();
        }
    } catch (error) {
        req.flash("flashError", "Server Error : Error with DB!");
        res.redirect("/login-documents");
    }
});


// Routes (Misc.)
router.get('/services', (req, res) => {
    const internals = {
        title: "Services",
        description: "PSF Offers various services including Advocacy, Membership, Market linkage, IBI...",
        hasFullFooter: true,
        inUser: req.session.in_user,
        funs: fun,
    }
    res.render('clients/services/index', { internals });
});


router.get('/contact', (req, res) => {
    const internals = {
        title: "Contact Us ",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    let names, email, phone, subject, cmessage = '';
    res.render('clients/about/contact', { 
        internals,
        names, email, phone, subject, cmessage,
        message: req.flash("fmessage"),
    });
});


// Post data to DB:
router.post('/contact-to-db', (req, res) => {
    let names = req.body.names;
    let email = req.body.email;
    let phone = req.body.phone;
    let subject = req.body.subject;
    let cmessage = fun.addSlashes(req.body.cmessage);

    if (names.length != 0 && email.length != 0 && phone.length != 0 && subject.length != 0 && cmessage.length != 0 ) {
        if(cmessage.length > 20) {
            let inData = {names: names, email: email, phone: phone, subject: subject, message: cmessage}
            con.query("INSERT INTO messages SET ?", inData, (err, results, fields) => {
                if (!err) {
                    req.flash("fmessage", "Your message has been sent!");
                    res.redirect('/contact');
                }
            })
        } else {
            req.flash("fmessage", "Your message is too short!");
            res.redirect("/contact");
        }
    } else {
        req.flash("fmessage", "Fill All required fields!");
        res.redirect("/contact");
    }
})



router.get('/support', (req, res) => {
    const internals = {
        title: "Support / F.A.Qs",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/about/support', { internals });
});

// Membership benefits page:
router.get('/membership', (req, res) => {
    const internals = {
        title: "PSF Membership",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/memberships', { internals });
});

// Member Join page
router.get('/join', (req, res) => {
    const internals = {
        title: "Join Membership",
        description: "",
        hasFullFooter: true,
        inUser: req.session.in_user,
    }
    res.render('clients/membership/join', { internals });
});



// Export this router
module.exports = router;
