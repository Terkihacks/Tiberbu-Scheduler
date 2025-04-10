const db = require('../config/dbconfig');	
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

  // Register a new patient
  exports.registerPatient = async(req,res)=>{
    try {
      // Fetch the data from the frontend
      const { first_name, last_name, email, password, phone, date_of_birth, gender, address,role } = req.body || null;
      const userRole = role || 'Patient';
      console.log("Received body",req.body); // Log the incoming request body
      // Check if a user already exists with the given email
      const[rows] =  await db.execute('SELECT * FROM patients WHERE email = ? ', [email]);

      if(rows.length > 0){
         return res.status(400).json({message: 'Email already exist,register for a new Account'});
      }
    
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.execute('INSERT INTO patients(first_name, last_name, email, password, phone, date_of_birth, gender, address,role) VALUES(?,?,?,?,?,?,?,?,?)',
        [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address,userRole]);

      // Return success message
      res.status(200).json({ message: 'Patient account registered successfully'});
    } catch (error) {
      console.log(error);
      console.error('Registration error:', error.message || error);
      res.status(500).json({ message: 'Error registering patient account', error });
    }
  };
  
    // Login patient
    exports.loginPatient = async(req,res) =>{

      try{
        //Fetch the request body
        const{email,password} = req.body;
        
        //Check if the email exists
        const[rows] = await db.execute('SELECT * FROM patients WHERE email = ?',[email]);

        if(rows.length === 0){
          return res.status(400).json({message:'User not found please register'})
        }
        
        //Check if the passwords match
        const user = rows[0];
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
          return res.status(400).json({message:'Invalid Credentials'});
        }
        else{
          //Generation of the token
          const token = jwt.sign(
            { 
              id:user.id,
              email:user.email,
              first_name:user.first_name,
              role:user.role
            },
            process.env.SECRET_KEY,
            {
              expiresIn:'1h' //Token expires in 1 hr
            }
          )
          //Send token back to the client
          res.status(200).json({ message: 'Login successful', token });
        }
        
      }catch(error){
         console.log(error);
         res.status(500).json({ message: 'Error logging in Patient', error });
      }

    };

    //GET Patient profile by id
    exports.getPatient = async(req,res) =>{
      try{
        const patient_id = req.user.id;
        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?',[patient_id])
        if (rows.length == 0){
          return res.status(404).json({message:"No patients found"})
        }
        const {first_name,last_name,phone,address,email,password} = rows[0];
        res.status(200).json({
          message:'Patient fetched successfully',
          data:{
            first_name,last_name,phone,address,email,password
          }
        })
      }catch(error){
        console.log(error)
      }
    }

    // Update the user profile
    exports.updatePatient = async(req,res) =>{
      try{
        const patient_id = req.user.id;
        const{first_name,last_name,phone,address} = req.body;
        
        const[result] = await db.query(
        `UPDATE patients SET 
          first_name = ?, 
          last_name = ?, 
          phone = ?,
          address = ?
          WHERE id = ?`,
        [first_name, last_name, phone, address, patient_id]
        );
  
        if (result.affectedRows === 0 ) {
          return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient data updated successfully' });

      }catch(error){
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    
      }

    }

    const blacklist =  new Set();
    exports.logoutUser = async(req,res) =>{
      const token = req.headers['authorization']?.split(' ')[1];
      if(!token) return res.status(400).json({messsage:'Toeken required'});
      blacklist.add(token);
      res.json({message:'Logged out successfully'})
    }

