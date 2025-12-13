const prisma = require('../db/client')

async function createAccount (customerId, initialDeposit){
    
    const customer = await prisma.customer.findUnique({
        where: {id: customerId}
    })

    if (!customer) { throw Error ('Customer not found')}
    if (initialDeposit <= 0) { throw Error ('Initial Deposit must be greater Zero')}

    const account = await prisma.account.create({
        data:{
            customerId,
            balance: initialDeposit
        }
    })
    
    return account
}

async function getBalance(accountId) {

    const account = await prisma.account.findUnique({
        where: {id: accountId}
    })

    if (!account){ throw new Error("Account not found");}

    return {
        accountId: account.id,
        balance: account.balance
    }
    
}


module.exports = {
    createAccount, getBalance
}