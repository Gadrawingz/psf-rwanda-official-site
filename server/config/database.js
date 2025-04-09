const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'psf_website',
    password: 'Pvssw0rd!123',
});

connection.connect( (error) => {
    if(error) {
        console.log(error.sqlMessage)
    } else {
        console.log("Database is connected!");   
    }
})

module.exports = connection;