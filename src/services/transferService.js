const prisma = require('../db/client')

async function accountTransfer(fromAccountId, toAccountId, amount) {
    
    if (amount <= 0) { 
        throw new Error("Transfer amount must be positive and more than Zero")
    }

    // Prevent transferring to the same account
    if (fromAccountId === toAccountId) {
        throw new Error("Cannot transfer to the same account")
    }

    // Use Prisma transaction to ensure atomicity
    // All account existence checks and balance validation happen INSIDE the transaction
    // to prevent race conditions where concurrent transfers could cause overdrafts
    const result = await prisma.$transaction(async (tx) => {
        // Check if source account exists and fetch current balance within transaction
        const fromAccount = await tx.account.findUnique({
            where: { id: fromAccountId }
        })
        
        if (!fromAccount) { 
            throw new Error("Source account does not exist")
        }

        // Check if destination account exists within transaction
        const toAccount = await tx.account.findUnique({
            where: { id: toAccountId }
        })
        
        if (!toAccount) { 
            throw new Error("Destination account does not exist")
        }

        // Check balance INSIDE transaction to prevent race conditions
        // This ensures the balance check and update are atomic
        if (fromAccount.balance < amount) { 
            throw new Error("Insufficient funds")
        }
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