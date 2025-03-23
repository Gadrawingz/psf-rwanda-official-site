const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'psf_website_bkp',
    password: 'g!1234',
});

connection.connect( (error) => {
    if(error) {
        console.log(error.sqlMessage)
    } else {
        console.log("Database is connected!");   
    }
})

module.exports = connection;