const express = require('express')
const authService = require('../services/authService')

const router = express.Router()

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and Password are required" })
    }

    try {
        const results = await authService.login(username, password)
        return res.status(200).json(results)
    } catch (error) {
        return res.status(401).json({ error: error.message || 'Invalid Credentials' })
    }
})

module.exports = router