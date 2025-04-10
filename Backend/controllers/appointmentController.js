//Import Packages
const getDoc = require('../utils/getDoc')
const db = require('../config/dbconfig.js');
const { sendToQueue } = require('../utils/rabbitmq');

exports.createAppointment = async(req,res) => {
  //Fetch info from the request body and perform the http requests
  const {doctor,appointment_date,appointment_time,status} = req.body ;
  
   try{
    const patient_id = req.user.id;
    const doctor_id = await getDoc(doctor,db);

    // Check for scheduling conflicts
    const conflictQuery = `
      SELECT * FROM Appointments
      WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
    `;
    const [conflicts] = await db.execute(conflictQuery, [doctor_id, appointment_date, appointment_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({ message: 'The doctor is not available at the selected time.' });
    }

   //Join the tables patients and doctors to obtain the patient_id and doctor_id
   const joinQuery = `
   SELECT p.id AS patient_id,
          d.id AS doctor_id
   FROM patients p
   INNER JOIN Doctors d ON p.id = ? AND d.id = ?
   LIMIT 1
   `
   //Perform join query
   const [rows] = await db.execute(joinQuery,[patient_id,doctor_id]);
   // If no matching rows are found, return an error
  if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
  }
   //Write queries to insert the data to the database if the doctor and the patient exist
   const insertQuery = `
   INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
   VALUES (?, ?, ?, ?,?);
   `;
   await db.execute(insertQuery, [patient_id, doctor_id, appointment_date, appointment_time,status]);

   // Send a message to RabbitMQ
   await sendToQueue('appointmentQueue', {
     action: 'create',
     appointment: { patient_id, doctor_id, appointment_date, appointment_time, status },
   });

   // Return success message
   res.status(201).json({ message: 'Appointment created successfully' });

   //Display success messages
   }catch(error){
      console.log(error)
    res.status(500).json({message:'Failed to create an Appointment'})
   }

}

exports.getAppointment = async(req,res) =>{
//Get the following info from the database
//Doctor name and doctor specialization from the doctors table
//The appointment date , status and time from the appointment table
  try{
  const patient_id = req.user.id;
  const query = `
  SELECT
  d.first_name AS doctor_name,
  d.specialization AS doctor_specialization,
  a.appointment_date,
  a.appointment_time,
  a.status
  FROM
  appointments a
  INNER JOIN
  doctors d ON a.doctor_id = d.id
  WHERE
  a.patient_id = ?

  `
  const [rows] = await db.execute(query,[patient_id]);
          // Check if appointments were found
          if (rows.length === 0) {
            return res.status(404).json({ message: "No appointments found for the user." });
        }

// Send the appointment data as a response
return res.status(200).json(rows);
  }
  catch(error){
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: "An error occurred while fetching appointments." });
  }
}

exports.getdocAppointment = async(req,res) =>{
  try{
    const doctor_id = req.user.id;
    const query = `
    SELECT 
    patients.first_name,
    patients.last_name,
    appointment_date,
    appointment_time,
    status,
    doctors.id AS doctor_id
    FROM 
    appointments
    INNER JOIN
    patients ON appointments.patient_id = patients.id
    INNER JOIN
    doctors ON appointments.doctor_id = doctors.id
    WHERE
    doctors.id = ?
    `
    const [rows] = await db.execute(query,[doctor_id]);
      //Check if appointments exist
      if(rows.length === 0){
        return res.status(404).json({
          success:false,
          message:'No appointments Found'
        });
       
      }
      //Send fetched data
      return res.status(200).json({
        // success:true,
        message:'Appointments fetched successfully',
        data:rows
      })
  }catch(error){
  console.log(error)
  return res.status(500).json({ message: "An error occurred while fetching appointments.",error });
  }
}


exports.updateAppointmnent = async(req,res) =>{
  const { id, appointment_date, appointment_time, status } = req.body;
  try {
    // Check if the appointment exists
    const [existingAppointment] = await db.execute('SELECT * FROM Appointments WHERE id = ?', [id]);
    if (existingAppointment.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check for scheduling conflicts
    const conflictQuery = `
      SELECT * FROM Appointments
      WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND id != ?
    `;
    const [conflicts] = await db.execute(conflictQuery, [
      existingAppointment[0].doctor_id,
      appointment_date,
      appointment_time,
      id,
    ]);

    if (conflicts.length > 0) {
      return res.status(400).json({ message: 'The doctor is not available at the selected time.' });
    }

    // Update the appointment
    const updateQuery = `
      UPDATE Appointments
      SET appointment_date = ?, appointment_time = ?, status = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(updateQuery, [appointment_date, appointment_time, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Failed to update appointment' });
    }

    // Send a message to RabbitMQ
    await sendToQueue('appointmentQueue', {
      action: 'update',
      appointment: { id, appointment_date, appointment_time, status },
    });

    res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
}

exports.deleteAppointment = async(req,res) =>{
  const { id } = req.body;

  try {
    // Check if the appointment exists
    const [rows] = await db.execute('SELECT * FROM Appointments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Delete the appointment
    await db.execute('DELETE FROM Appointments WHERE id = ?', [id]);
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting the appointment', error });
  }
}
