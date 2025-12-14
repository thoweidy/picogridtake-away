require('dotenv').config();

const express = require('express')
const authRoutes = require('./src/routes/auth')
const accountRoutes = require('./src/routes/account')
const transferRoutes = require('./src/routes/transfer')
const docsRoutes = require('./src/routes/docs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json());

// API Documentation
app.use('/api-docs', docsRoutes)

// Authentication routes (public - no auth required)
app.use('/api/auth', authRoutes)

// Account routes (protected - require authentication)
// POST /api/accounts - Create account
// GET /api/accounts/:id - Get account balance
// GET /api/accounts/:id/transfers - Get transfer history
app.use('/api/accounts', accountRoutes)

// Transfer routes (protected - require authentication)
// POST /api/transfers - Transfer funds between accounts
app.use('/api/transfers', transferRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`)
})
