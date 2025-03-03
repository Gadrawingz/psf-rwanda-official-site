// Imports
const express = require("express");
const path = require("path");
const router = express.Router();
const con = require("../config/database");
const fun = require("../config/functions");

// 00. View all data
router.get("/data", (req, res) => {
  if (req.session.in_user && req.session.in_user.loggedin == true) {
    con.query(
      "SELECT tin_number AS TaxpayerTIN, company AS TaxPayerName, telephone AS PhoneNumber, CONCAT(firstname,' ', lastname)AS RepresentativeName, telephone AS RepresentativePhone, '2024' AS fiscalYear, paid_status AS eligibility, request_date FROM members",
      (error, rows) => {
        const internals = {
          title: "View all quitus data",
          breadcrumbL1: "Quitus",
          breadcrumbL2: "All",
          inUser: req.session.in_user,
          data: rows,
          funs: fun,
        };

        if (!error) {
          res.status(200).json(rows);
        } else {
          res.status(500).json({ error: error });
        }
      }
    );
  } else {
    req.flash("flashError", "Login for access to API!");
    res.redirect("/panel/login");
  }
});

// GET user by ID
router.get("/lookup/(:tin)", (req, res) => {
    const tinNo = req.params.tin;
      con.query(`SELECT tin_number AS TaxpayerTIN, company AS TaxPayerName, telephone AS PhoneNumber, CONCAT(firstname,' ', lastname)AS RepresentativeName, telephone AS RepresentativePhone, '2024' AS fiscalYear, paid_status AS eligibility, request_date FROM members WHERE tin_number = '${tinNo}'`,
        (error, rows) => {
          const internals = {
            title: "View all quitus data",
            breadcrumbL1: "Quitus",
            breadcrumbL2: "All",
            inUser: req.session.in_user,
            data: rows,
            funs: fun,
          };

          if (!error) {
            res.status(200).json(rows);
          } else {
            res.status(500).json({ error: error });
          }
        }
    );

});


// Export the router
module.exports = router;
