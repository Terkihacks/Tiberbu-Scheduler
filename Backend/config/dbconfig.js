const mysql =  require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    //Access the .env files
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD
 });
 // Test the connection to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } 
    else {
        console.log('Database connected successfully!');
        connection.release(); // Release the connection back to the pool
    }
});
// Lets export the db.js to be able to be available in all our files
module.exports = pool.promise()