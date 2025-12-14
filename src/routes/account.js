const express = require('express')
const accountService = require('../services/accountService')
const transferService = require('../services/transferService')
const authenticate = require('../middleware/authenticates')

const router = express.Router()

// Apply authentication middleware to all account routes
router.use(authenticate)

// POST /api/accounts - Create a new bank account
router.post('/', async (req, res) => {
    const { customerId, initialDeposit } = req.body

    if (!customerId || !initialDeposit) {
        return res.status(400).json({ errorMessage: "CustomerID and Initial Deposit are required" })
    }

    try {
        const results = await accountService.createAccount(customerId, initialDeposit)
        return res.status(201).json(results)
    } catch (error) {
        if (error.message === "Customer not found") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

// GET /api/accounts/:id - Get account balance
router.get('/:id', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ errorMessage: "accountId is required" })
    }

    try {
        const accountIdNum = parseInt(id)
        if (isNaN(accountIdNum)) {
            return res.status(400).json({ errorMessage: "accountId must be a valid number" })
        }
        const results = await accountService.getBalance(accountIdNum)
        return res.status(200).json(results)
    } catch (error) {
        if (error.message === "Account not found") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

// GET /api/accounts/:id/transfers - Get transfer history for an account
router.get('/:id/transfers', async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ errorMessage: "accountId is required" })
    }

    try {
        const accountIdNum = parseInt(id)
        if (isNaN(accountIdNum)) {
            return res.status(400).json({ errorMessage: "accountId must be a valid number" })
        }
        const results = await transferService.getTransferHistory(accountIdNum)
        return res.status(200).json(results)
    } catch (error) {
        if (error.message === "Account not found") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

module.exports = router