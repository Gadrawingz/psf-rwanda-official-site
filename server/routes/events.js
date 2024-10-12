/**********************************
All specific routes related to events
***********************************/

const express = require("express");
const multer = require("multer");
const path = require('path')
const router = express.Router();
const con = require("../config/database");
const fun = require("../config/functions");


// 01. Get event registration form
router.get("/add", (req, res) => {
    let eventName, eventVenue, eventType, eventImage, startDate, endingDate, contEmail, contPhone, describing = "";
    if (req.session.loggedin === true && req.session.loggedin != undefined) {
        const internals = {
            title: "Event Registration",
            breadcrumbL1: "Events",
            breadcrumbL2: "New",
            role: req.session.role,
            admin_id: req.session.admin_id,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
        };
        res.render("admin/events/add-event", {
            layout: "./layouts/LAdmin",
            internals,
            message: req.flash("fmessage"),
            eventName, eventVenue, eventType, eventImage, startDate,
            endingDate, contEmail, contPhone, describing
        });
    } else {
        req.flash("flashError", "Login to register user!");
        res.redirect("/panel/login");
    }
});


// A. Configure storage engine and filename
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/events");
    },

    filename: function (req, file, cb) {
        cb(null, `ev-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// B. Custom function to check the file type
function gadCheckFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Image should have jpeg, jpg, png, gif and WebP extensions');
    }
}

// C. Add file type validation
const upload4events = multer({
    storage: imageStorage,
    limits: { fileSize: (1024 * 1024) * 3 }, // size is limited to 3 MB
    fileFilter: (req, file, cb) => {
        gadCheckFileType(file, cb);
    }
}).single('event_image');

// 02. Handling event insert
router.post("/insert", (req, res) => {
    upload4events(req, res, (err) => {
        let eventName = req.body.event_name;
        let eventVenue = req.body.event_venue;
        let eventType = req.body.event_type;
        let eventImage = req.body.event_image;
        let startDate = req.body.start_date;
        let endingDate = req.body.end_date;
        let contEmail = req.body.contact_email;
        let contPhone = req.body.contact_phone;
        let describing = req.body.description;

        const internals = {
            title: "Event Registration",
            breadcrumbL1: "Events",
            breadcrumbL2: "New",
            role: req.session.role,
            admin_id: req.session.admin_id,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
        };

        if (!err) {
            if (eventName.length != 0 && eventVenue.length != 0 && startDate.length != 0 && endingDate.length != 0 && contEmail.length != 0 && contPhone.length != 0 && describing.length != 0 && eventType.length != 0) {
                if (req.file) {
                    if (eventName.length >= 5 && describing.length >= 50) {
                        // ON SUCCESSFUL ACTS
                        let eventsData = {
                            event_name: (eventName),
                            event_venue: eventVenue,
                            event_type: eventType,
                            event_image: req.file.filename,
                            start_date: startDate,
                            end_date: endingDate,
                            contact_email: contEmail,
                            contact_phone: contPhone,
                            description: (describing),
                        };

                        con.query("INSERT INTO events SET ?", eventsData, (err, results, fields) => {
                            if (err) {
                                req.flash("fmessage", "Error occurred in database!");
                                res.render("admin/events/add-event", {
                                    layout: "./layouts/LAdmin",
                                    internals,
                                    message: req.flash("fmessage"),
                                    eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing
                                })
                            } else {
                                res.redirect("/events/all");
                            }
                        });
                    } else {
                        req.flash("fmessage", "The title or description is too short!");
                        res.render("admin/events/add-event", {
                            layout: "./layouts/LAdmin",
                            internals,
                            message: req.flash("fmessage"),
                            eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing
                        })
                        let fs = require("fs");
                        let path2file = "public/uploads/events/" + eventImage;
                        if (fs.existsSync(path2file)) {
                            fs.unlinkSync(path2file);
                        }
                    }
                } else {
                    req.flash("fmessage", "No file uploaded");
                    res.render("admin/events/add-event", {
                        layout: "./layouts/LAdmin",
                        internals,
                        message: req.flash("fmessage"),
                        eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing
                    })
                }
            } else {
                req.flash("fmessage", "All fields are required!");
                res.render("admin/events/add-event", {
                    layout: "./layouts/LAdmin",
                    internals,
                    message: req.flash("fmessage"),
                    eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing
                })
            }
        } else {
            req.flash("fmessage", "ERROR: " + err);
            res.render("admin/events/add-event", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
                eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing
            })
        }
    })
});


// 03. Get all events
router.get('/all', (req, res) => {
    con.query("SELECT * FROM events ORDER BY event_id DESC LIMIT 20", (error, rows) => {
        const internals = {
            title: "View all events in order",
            breadcrumbL1: "Events",
            breadcrumbL2: "All",
            role: req.session.role,
            admin_id: req.session.admin_id,
            username: req.session.username,
            telephone: req.session.telephone,
            fullName: `${req.session.firstname} ${req.session.lastname}`,
            data: rows,
            funs: fun,
        };
        
        if (!error) {
            // @gadira
            res.render("admin/events/view-events", {
                layout: "./layouts/LAdmin",internals,
                message: "",
            });
        } else {
            req.flash("fmessage", "There is an error occured");
            res.render("admin/events/view-events", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});


// 04. Remove event item
router.get("/delete/(:id)", (req, res) => {
    let id = req.params.id;
    let sql3 = `SELECT * FROM events WHERE event_id = ${id}`;

    con.query(sql3, (err, rows, fields) => {
        if (err) throw err;
        if (rows.length > 0) {
            // Remove the file 1st
            let fs = require("fs");
            let path2file = "public/uploads/events/" + rows[0].event_image;
            let newPath44 = "public/uploads/trash/events/" + rows[0].event_image;
            if (fs.existsSync(path2file)) {
                fs.renameSync(path2file, newPath44);
                let sql4 = `DELETE FROM events WHERE event_id = ${id}`;
                con.query(sql4, (error, result) => {
                    if (!error) {
                        req.flash("fmessage", `The record with ID: ${id} removed!`);
                        res.redirect("/events/all");
                    } else {
                        req.flash("fmessage", `Cannot remove a record with ID: ${id}!`);
                        res.redirect("/events/all");
                    }
                });
            } else {
                req.flash("fmessage", "No file to remove found!");
                res.redirect("/events/all");
            }
        } else {
            req.flash("fmessage", `Record was not found!`);
            res.redirect("/events/all");
        }
    });
});


// 05. Edit event item:
router.get("/edit/(:id)", (req, res, next) => {
    let id = req.params.id;
    let sql = `SELECT * FROM events WHERE event_id= ${id}`;
    con.query(sql, (err, rows, fields) => {
        if (err) throw err;
        const internals = {
            title: `Update (${rows[0].event_name})`,
            event_id: rows[0].event_id,
            eventName: rows[0].event_name,
            eventVenue: rows[0].event_venue,
            eventType: rows[0].event_type,
            describing: rows[0].description,
            startDate: rows[0].start_date,
            endingDate: rows[0].end_date,
            contEmail: rows[0].contact_email,
            contPhone: rows[0].contact_phone,
            has3RouteSegments: true,
        };

        if (rows.length <= 0) {
            req.flash("error", `No ID:${id} is found`);
            res.redirect("/events/all");
        } else {
            res.render("admin/events/edit-event", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
            });
        }
    });
});


// 03. Posting event update
router.post("/update-event/(:id)", (req, res, next) => {
    let id = req.params.id;
    let eventName = req.body.event_name;
    let eventVenue = req.body.event_venue;
    let eventType = req.body.event_type;
    let startDate = req.body.start_date;
    let endingDate = req.body.end_date;
    let contEmail = req.body.contact_email;
    let contPhone = req.body.contact_phone;
    let describing = req.body.description;

    if (
        eventName.length != 0 &&
        eventVenue.length != 0 &&
        startDate.length != 0 &&
        endingDate.length != 0 &&
        contEmail.length != 0 &&
        contPhone.length != 0 &&
        describing.length != 0 &&
        eventType.length != 0
    ) {
        if (eventName.length >= 5 && describing.length >= 50) {
            // ON SUCCESSFUL:
            up = [eventName, eventVenue, eventType, startDate, endingDate, contEmail, contPhone, describing, id];
            con.query("UPDATE events SET event_name = ?, event_venue = ?, event_type = ?, start_date = ?, end_date = ?, contact_email = ?, contact_phone = ?, description = ? WHERE event_id = ?", up, (err, results, fields) => {
                    if (err) {
                        req.flash("fmessage", "Error occurred in database!");
                        res.redirect(`/events/edit/${id}`);
                    } else {
                        res.redirect("/events/all");
                    }
                }
            );
        } else {
            req.flash("fmessage", "The title or description is too short!");
            res.redirect(`/events/edit/${id}`);
            // Do not allow file to be saved
            let fs = require("fs");
            let path2file = "public/uploads/events/" + eventImage;
            if (fs.existsSync(path2file)) {
                fs.unlinkSync(path2file);
            }
        }
    } else {
        req.flash("fmessage", "All fields are required!");
        res.redirect(`/events/edit/${id}`);
    }
});



module.exports = router;