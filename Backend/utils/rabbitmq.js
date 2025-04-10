const amqp = require('amqplib');

let channel, connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost'); // Replace with your RabbitMQ URL
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

async function sendToQueue(queue, message) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

async function closeRabbitMQ() {
  await channel.close();
  await connection.close();
}

module.exports = { connectRabbitMQ, sendToQueue, closeRabbitMQ };
