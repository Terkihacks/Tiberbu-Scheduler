const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
// Import routes
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const cors = require('cors');
const { connectRabbitMQ } = require('./utils/rabbitmq');
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes usage
app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);
app.use('/appointment', appointmentRoutes);

(async () => {
  await connectRabbitMQ();
  // Start your server
  app.listen(process.env.PORT || 4600, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
})();

