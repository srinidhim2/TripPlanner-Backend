const express = require('express')
const app  = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Message Service is running')
})

const PORT = process.env.MESSAGE_SERVICE_PORT || 4000
app.listen(PORT, () => {
    console.log(`Message Service is listening on port ${PORT}`)
})