// utils/kafkaProducer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'trip-management',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();

async function sendKafkaMessage(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
}

module.exports = { sendKafkaMessage };