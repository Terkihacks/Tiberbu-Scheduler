// controllers/DoctorController.js
const db = require('../config/dbconfig.js');	
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
    // CREATE: Add a new doctor
    exports.createDoctor = async(req,res) =>{
        try{
            const{first_name,last_name,specialization,email,phone,password,role} = req.body;
            const userRole = role || 'Doctor'
            // console.log('Requested body',req.body)
            const [rows] = await db.execute('SELECT * FROM doctors WHERE email = ?',[email]);
            if (rows.length > 0){
                return res.status(400).json({message:'Email already exists,register for a new Doctor Account'}); }
            
                const hashedPassword = await bcrypt.hash(password,10);
                await db.execute('INSERT INTO doctors(first_name,last_name,specialization,email,phone,password,role) VALUES(?,?,?,?,?,?,?)',
                    [first_name,last_name,specialization,email,phone,hashedPassword,userRole]);
                    res.status(200).json({message: 'Doctors Account created successfully'})
           
        }catch(error){
            console.log(error);
            console.error('Registration error:', error.message || error);
            res.status(500).json({ message: 'Error registering patient account', error });
        }
    }
    exports.loginDoctor = async(req,res) =>{
        try{
        
            const{email,password} = req.body;
            const[rows] =  await db.execute('SELECT * FROM doctors WHERE email = ?',[email]);
            if(rows.length === 0){
                return res.status(400).json({message:"Doctor not found,register for a new one"})
            }
            const doc = rows[0];
            const isMatch = await bcrypt.compare(password,doc.password);
            if(!isMatch){
                return res.status(400).json({message:"Invalid Credentials"});
            }
            else{
                //Generate a token
                const token = jwt.sign(
                    {   
                        id:doc.id,
                        email:doc.email,
                        first_name:doc.first_name,
                        role:doc.role
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn:'1hr'
                    }
                )
                res.status(200).json({ message: 'Login successful', token });
            }           
        }catch(error){
            console.log(error);
            res.status(500).json({ message: 'Error logging in Patient', error });
        }
    }
     //Fetch doctors profile by id

     exports.getDocProfile = async(req,res) =>{
        try{
            const doctor_id = req.user.id;
            // console.log(`Fetching profile for doctor ID: ${doctor_id}`);
            const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?',[doctor_id]);
            if(rows.length === 0){
                return res.status(404).json({message:'No Doctors Found'});
            }
            const { first_name, last_name, specialization, email, phone, password } = rows[0];
          res.status(200).json({
                message:"Doctors profile fetched successfully",
                data:{
                    first_name,last_name,specialization,email,phone,password
                }
            })
        }catch(error){
            console.log(error)
        }
     }
 
    // UPDATE: Update a doctor's profile by id
    exports.updateProfile = async(req,res) =>{
        const doctor_id = req.user.id;
        const { first_name, last_name, specialization, phone } = req.body;
        // Check if the user to update is available
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?',[doctor_id]);
            if(rows.length === 0){
                return res.status(404).json({message:'No Doctors Found'});
            }
            const [updatedquery] = await db.query(`
                UPDATE doctors SET 
                first_name = ?,
                last_name = ?, 
                specialization = ?, 
                phone = ?
                 WHERE id = ?
                `,[first_name, last_name, specialization, phone,doctor_id])
               
                res.status(200).json({
                    message:"Doctors profile updated successfully",
                    data:{first_name, last_name, specialization, phone}
                })

    }

     // DELETE: Deactivate or delete a doctor profile
   exports.deleteById = async(req,res) =>{
        const doctor_id = req.user.id;
        // Check if the user to update is available
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?',[doctor_id]);
            if(rows.length === 0){
                return res.status(404).json({message:'No Doctors Found'});
            }
            await db.query(`DELETE FROM doctors WHERE id = ?`,[doctor_id])
            res.status(200).json({
                message:"Doctors Account deleted succesfully"
            })
   }
   
//Soft Delete Alternative: Instead of deleting the row from the database, consider marking it as inactive:
// UPDATE doctors SET is_active = 0 WHERE id = ?;
//This approach preserves historical data while preventing further use.
