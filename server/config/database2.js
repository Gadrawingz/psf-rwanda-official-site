const mysql2 = require('mysql2/promise');

const connection = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pvssw0rd!123',
    database: 'psf_website'
});

module.exports = connection;
