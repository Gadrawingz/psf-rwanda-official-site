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
    let eventName, eventVenue, eventImage, startDate, endingDate, contEmail, contPhone, describing = "";
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
            eventName, eventVenue, eventImage, startDate,
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
            if (eventName.length != 0 && eventVenue.length != 0 && startDate.length != 0 && endingDate.length != 0 && contEmail.length != 0 && contPhone.length != 0 && describing.length != 0) {
                if (req.file) {
                    if (eventName.length >= 5 && describing.length >= 50) {
                        // ON SUCCESSFUL ACTS
                        let eventsData = {
                            event_name: (eventName),
                            event_venue: eventVenue,
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
                                    eventName, eventVenue, startDate, endingDate, contEmail, contPhone, describing
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
                            eventName, eventVenue, startDate, endingDate, contEmail, contPhone, describing
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
                        eventName, eventVenue, startDate, endingDate, contEmail, contPhone, describing
                    })
                }
            } else {
                req.flash("fmessage", "All fields are required!");
                res.render("admin/events/add-event", {
                    layout: "./layouts/LAdmin",
                    internals,
                    message: req.flash("fmessage"),
                    eventName, eventVenue, startDate, endingDate, contEmail, contPhone, describing
                })
            }
        } else {
            req.flash("fmessage", "ERROR: " + err);
            res.render("admin/events/add-event", {
                layout: "./layouts/LAdmin",
                internals,
                message: req.flash("fmessage"),
                eventName, eventVenue, startDate, endingDate, contEmail, contPhone, describing
            })
        }
    })
});





module.exports = router;