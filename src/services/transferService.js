const prisma = require('../db/client')

async function accountTransfer(fromAccountId, toAccountId, amount) {
    
    if (amount <= 0) { 
        throw new Error("Transfer amount must be positive and more than Zero")
    }

    // Check if source account exists
    const fromAccount = await prisma.account.findUnique({
        where: { id: fromAccountId }
    })
    
    if (!fromAccount) { 
        throw new Error("Source account does not exist")
    }

    // Check if destination account exists
    const toAccount = await prisma.account.findUnique({
        where: { id: toAccountId }
    })
    
    if (!toAccount) { 
        throw new Error("Destination account does not exist")
    }

    // Check if source account has sufficient balance
    if (fromAccount.balance < amount) { 
        throw new Error("Insufficient funds")
    }

    // Prevent transferring to the same account
    if (fromAccountId === toAccountId) {
        throw new Error("Cannot transfer to the same account")
    }

    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // Update source account balance
        const updatedFromAccount = await tx.account.update({
            where: { id: fromAccountId },
            data: { balance: { decrement: amount } }
        })

        // Update destination account balance
        const updatedToAccount = await tx.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } }
        })

        // Create transfer record
        const transfer = await tx.transfer.create({
            data: {
                fromAccountId,
                toAccountId,
                amount
            }
        })

        return {
            transfer,
            fromAccount: updatedFromAccount,
            toAccount: updatedToAccount
        }
    })

    return result
}

async function getTransferHistory(accountId) {
    
    const account = await prisma.account.findUnique({
        where: { id: accountId }
    })

    if (!account) {
        throw new Error("Account not found")
    }

    const transfers = await prisma.transfer.findMany({
        where: {
            OR: [
                { fromAccountId: accountId },
                { toAccountId: accountId }
            ]
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            fromAccount: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            toAccount: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    return transfers
}

module.exports = {
    accountTransfer,
    getTransferHistory
}
