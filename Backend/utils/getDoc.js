const db = require('../config/dbconfig.js');
// This function retrieves a specific doctor by their first name and ID from the database.
const getDocById = async(doctorName,db) =>{
    try{
        const [rows] = await db.query('SELECT * FROM doctors WHERE first_name = ? LIMIT 1',[doctorName]);
        return rows.length > 0 ? rows[0].id : null;
    }catch(error){
        console.log("Error fetching doctor by ID:", error.message);
        throw new Error("An error occurred while fetching the doctor");
    }
    
 }
module.exports = getDocById