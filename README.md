# Tiberbu Scheduler Backend

A medical appointment scheduling system backend built with Node.js, Express, MySQL, and RabbitMQ.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- RabbitMQ (v3.8 or higher)
- Git

## Setup Instructions

1. **Clone the Repository**
```bash
git clone <repository-url>
cd Backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=telemed
SECRET_KEY=your_secret_key
PORT=4500
```

4. **Set Up Database**
```bash
# Login to MySQL
mysql -u root -p

# Run the migration script
source database/migrations.sql
```

5. **Start RabbitMQ Service**
```bash
# Windows
net start RabbitMQ
```

6. **Start the Application**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Patient Routes
- POST `/patient/register` - Register new patient
- POST `/patient/login` - Patient login

### Doctor Routes
- POST `/doctor/register` - Register new doctor
- POST `/doctor/login` - Doctor login

### Appointment Routes
- POST `/appointment/createappointment` - Create new appointment
- GET `/appointment/getappointments` - Get patient appointments
- GET `/appointment/getdocAppointment` - Get doctor appointments
- PUT `/appointment/update` - Update appointment
- DELETE `/appointment/delete` - Delete appointment

## Testing

Run the test suite:
```bash
npm test
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Queue Management

RabbitMQ is used for:
- Appointment notifications
- Email sending
- Status updates

## Security

- JWT authentication
- Password hashing with bcrypt
- Input validation
- CORS enabled

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
