const express = require('express');
const router = express.Router();
const {createDoctor,loginDoctor,getDocProfile, updateProfile,deleteById} = require('../controllers/doctorController');
const doctorMiddleware = require('../middleware/doctorMiddleware')

router.post('/register', createDoctor);
router.post('/login',loginDoctor);


module.exports = router;