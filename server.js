require('dotenv').config();

const express = require('express')
const authRoutes = require('./src/routes/auth')
const accountRouts = require('./src/routes/account')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());

// Authontication
app.use('/api/auth', authRoutes)

// Account Service
app.use('/api/account', accountRouts)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
