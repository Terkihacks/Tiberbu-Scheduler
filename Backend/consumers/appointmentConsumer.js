const amqp = require('amqplib');

async function startConsumer() {
  try {
    const connection = await amqp.connect('amqp://localhost'); // Replace with your RabbitMQ URL
    const channel = await connection.createChannel();
    const queue = 'appointmentQueue';

    await channel.assertQueue(queue);
    console.log(`Waiting for messages in ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        console.log('Received message:', message);

        // Process the message (e.g., send email notifications, update logs, etc.)
        // Example:
        if (message.action === 'create') {
          console.log('Processing appointment creation:', message.appointment);
        } else if (message.action === 'update') {
          console.log('Processing appointment update:', message.appointment);
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error in RabbitMQ consumer:', error);
  }
}

startConsumer();
