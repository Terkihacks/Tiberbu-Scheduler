const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
dotenv.config();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiberbu Scheduler API',
      version: '1.0.0',
      description: 'Medical Appointment Scheduling System API',
      contact: {
        name: 'API Support',
        email: 'support@tiberbuscheduler.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4600}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './swagger/*.js'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

