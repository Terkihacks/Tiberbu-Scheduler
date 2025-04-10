const express = require('express');
const router = express.Router();
const { registerPatient, loginPatient } = require('../controllers/patientsController');


router.post('/register',registerPatient);
router.post('/login',loginPatient)


module.exports = router;