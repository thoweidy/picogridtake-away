require('dotenv').config();

const express = require('express')
const authRoutes = require('./src/routes/auth')
const accountRouts = require('./src/routes/account')
const docsRoutes = require('./src/routes/docs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());

// API Documentation
app.use('/api-docs', docsRoutes)

// Authentication routes (public - no auth required)
app.use('/api/auth', authRoutes)

// Account Service routes (protected - require authentication)
app.use('/api/account', accountRouts)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`)
})
