const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
async function main() {
    // Seeding customer data (idempotent - check if exists before creating)
    console.log('Starting customers seed process ... ')
    const customers = [
        {name: 'Arisha Barron'},
        {name: 'Branden Gibson'},
        {name: 'Rhonda Church'},
        {name: 'Georgina Hazel'}
    ];

    for (const customer of customers) {
        const existingCustomer = await prisma.customer.findFirst({
            where: { name: customer.name }
        });
        if (!existingCustomer) {
            await prisma.customer.create({
                data: customer
            });
        }
    }
    console.log("Customers data seeded successfully")

    // Seeding in Employees Data (idempotent - use upsert with unique username)
    const hashedPassword = await bcrypt.hash('password123', 10)
    console.log("Starting employees seeding process ....")
    
    await prisma.employee.upsert({
        where: { username: 'employee1' },
        update: {
            password: hashedPassword, // Update password in case it changed
            name: "Jacques Cousteau",
            role: "teller"
        },
        create: {
            username: 'employee1',
            password: hashedPassword,
            name: "Jacques Cousteau",
            role: "teller"
        }
    });

    await prisma.employee.upsert({
        where: { username: 'manager1' },
        update: {
            password: hashedPassword, // Update password in case it changed
            name: "Poseidon no last name",
            role: "manager"
        },
        create: {
            username: "manager1",
            password: hashedPassword,
            name: "Poseidon no last name",
            role: "manager"
        }
    });
    
    console.log("Employees data seeded successfully")
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect()
})
