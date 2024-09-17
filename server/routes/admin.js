/**********************************
This page shows all the routes specific 
to admin table, and related pages
***********************************/
const express = require('express')
const router = express.Router();
const sql = require('mysql')
const DBConn = require('../config/database');

// To be able to send flash...
const flash = require('express-flash')
router.use(flash())






// Export this router
module.exports = router;