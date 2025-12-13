const prisma = require('../db/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function login(username, password) {

    // Finding employee with a unique username
    const employee = await prisma.employee.findUnique({
        where: { username }
    })
    if (!employee) { throw new Error("Invalid credentials") }

    //  Check if the provided password matches the crypted password in the database
    const isValidPassword = await bcrypt.compare(password, employee.password)
    if (!isValidPassword) { throw new Error("Invalid credentials") }

    //  Assuming user has valid credentials I will be generating token
    const token = jwt.sign(
        {
            employeeId: employee.id,
            username: employee.username,
            role: employee.role
        },
        process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE || '24h'}
    )

    return {
        token,
        employee: {
            employeeId: employee.id,
            username: employee.username,
            role: employee.role
        }
    }

}

module.exports = {
    login
}