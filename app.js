const express = require('express')
const cors = require('cors')
const {db} = require('./db/db')
const {readdirSync} = require('fs')
const connectCloudinary = require('./config/cloudinary')


const app = express()

require('dotenv').config()

const PORT = process.env.PORT || 5000
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())

//routes
readdirSync('./routes').map((routes) => app.use('/api/v1', require(`./routes/${routes}`)))

app.get('/', (req, res) => {
    res.send('Hello World')
})

const server = () => {
    db()
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)})
    
}


server()