const express = require('express');
// const jwtTokenMiddleware = require('../middleware/jwtTokenMiddleware')
const doctorMiddleware = require('../middleware/doctorMiddleware')
const{createAppointment,getAppointment,getdocAppointment} = require('../controllers/appointmentController');
const router =  express.Router();

router.post('/createappointment',createAppointment);
router.get('/getappointments',doctorMiddleware,getAppointment);
router.get('/getdocAppointment',getdocAppointment)
// router.put('/appointments/:id',adminMiddleware, updateAppointment);
// router.delete('/appointments/:id',adminMiddleware,deleteAppointment);

module.exports = router;