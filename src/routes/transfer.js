const express = require('express')
const transferService = require('../services/transferService')
const authenticate = require('../middleware/authenticates')

const router = express.Router()

// Apply authentication middleware to all transfer routes
router.use(authenticate)

// POST /api/transfers - Transfer funds between accounts
router.post('/', async (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body

    if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ errorMessage: "fromAccountId, toAccountId, and amount are required fields" })
    }
    try {
        const results = await transferService.accountTransfer(fromAccountId, toAccountId, amount)
        return res.status(201).json(results)
    } catch (error) {
        if (error.message === "Source account does not exist" || error.message === "Destination account does not exist") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

module.exports = router

