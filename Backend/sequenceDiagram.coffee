sequenceDiagram
    participant Patient
    participant Frontend
    participant AuthAPI
    participant AppointmentAPI
    participant RabbitMQ
    participant Database
    participant Doctor
    participant Notifications

    %% Patient Registration/Login Flow
    Patient->>Frontend: Register/Login
    Frontend->>AuthAPI: POST /patient/login
    AuthAPI->>Database: Validate Credentials
    Database-->>AuthAPI: Return User Data
    AuthAPI-->>Frontend: Return JWT Token
    Frontend->>Patient: Show Dashboard

    %% Appointment Booking Flow
    Patient->>Frontend: Book Appointment
    Frontend->>AppointmentAPI: POST /appointment/create
    AppointmentAPI->>Database: Check Doctor Availability
    Database-->>AppointmentAPI: Return Available Slots
    AppointmentAPI->>Database: Save Appointment
    AppointmentAPI->>RabbitMQ: Publish Appointment Event
    RabbitMQ->>Notifications: Process Notification
    Notifications->>Doctor: Send Email Notification
    Notifications->>Patient: Send Confirmation
    AppointmentAPI-->>Frontend: Return Success
    Frontend->>Patient: Show Confirmation

    %% Doctor Appointment Management
    Doctor->>Frontend: View Appointments
    Frontend->>AppointmentAPI: GET /appointment/getdocAppointment
    AppointmentAPI->>Database: Fetch Appointments
    Database-->>AppointmentAPI: Return Appointments
    AppointmentAPI-->>Frontend: Return Appointment List
    Frontend->>Doctor: Display Appointments

    %% Status Update Flow
    Doctor->>Frontend: Update Status
    Frontend->>AppointmentAPI: PUT /appointment/update
    AppointmentAPI->>Database: Update Status
    AppointmentAPI->>RabbitMQ: Publish Status Update
    RabbitMQ->>Notifications: Process Status Change
    Notifications->>Patient: Send Status Update
    Database-->>AppointmentAPI: Confirm Update
    AppointmentAPI-->>Frontend: Return Success
    Frontend->>Doctor: Show Updated Status