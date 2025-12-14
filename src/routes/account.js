const express = require('express')
const accountService = require('../services/accountService')
const transferService = require('../services/transferService')
const authenticate = require('../middleware/authenticates')

const router = express.Router()

// Apply authentication middleware to all account routes
router.use(authenticate)

router.put('/createaccount', async (req, res) => {
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

router.post('/getbalance', async (req, res) => {
    const { accountId } = req.body

    if (!accountId) {
        return res.status(400).json({ errorMessage: "accountId is required" })
    }

    try {
        const results = await accountService.getBalance(accountId)
        return res.status(200).json(results)
    } catch (error) {
        if (error.message === "Account not found") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

router.put('/transfer', async (req, res) => {
    const { fromAccountId, toAccountId, transferAmount } = req.body

    if (!fromAccountId || !toAccountId || !transferAmount) {
        return res.status(400).json({ errorMessage: "fromAccountId, toAccountId, and transferAmount are required fields" })
    }
    try {
        const results = await transferService.accountTransfer(fromAccountId, toAccountId, transferAmount)
        return res.status(201).json(results)
    } catch (error) {
        if (error.message === "Source account does not exist" || error.message === "Destination account does not exist") {
            return res.status(404).json({ errorMessage: error.message })
        }
        return res.status(400).json({ errorMessage: error.message })
    }
})

router.get('/transfer-history/:accountId', async (req, res) => {
    const { accountId } = req.params

    if (!accountId) {
        return res.status(400).json({ errorMessage: "accountId is required" })
    }

    try {
        const accountIdNum = parseInt(accountId)
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