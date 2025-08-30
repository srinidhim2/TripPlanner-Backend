// utils/kafkaConsumer.js
const { Kafka } = require('kafkajs');
const {logger} = require('../logger/logger');
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

async function runConsumer(topic, messageHandler) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // message.value is a Buffer
        try {
            const parsedValue = JSON.parse(message.value.toString());
            await messageHandler(parsedValue);
        } catch (err) {
            console.error('Failed to parse message:', message.value.toString(), err);
        }
    },
  });
}

module.exports = { runConsumer };
