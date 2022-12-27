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
app.use('/api/sellerauth', require('./routes/seller'))
app.use('/api/customerauth', require('./routes/customer'))
app.use('/api/milk', require('./routes/milk'))
app.use('/api/request', require('./routes/request'))
app.use('/api/customer_seller', require('./routes/customer_seller'))
app.use('/api/guestcustomer', require('./routes/guestcustomer'))





app.listen(port, () => {
  console.log(`backend listening at http://localhost:${port}`)
})