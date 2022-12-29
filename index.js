const connectToMongo = require('./db');
const express = require('express')
const cors=require('cors')
//require('dotenv/config');
connectToMongo();
const app = express()
const port = process.env.PORT || 6000

app.use(express.json())
app.use(cors())
app.use('/assets',express.static('assets'));
// Available Routes
app.use('/api/faculty', require('./routes/faculty'))
app.use('/api/student', require('./routes/student'))
app.use('/api/stallowner', require('./routes/stallowner'))
app.use('/api/cafe', require('./routes/cafe'))
app.use('/api/stall', require('./routes/stall'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/order', require('./routes/order'))

app.listen(port, () => {
  console.log(`backend listening at http://localhost:${port}`)
})