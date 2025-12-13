const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
async function main() {
    // seeding in customer data
    console.log('Starting customers seed process ... ')
    await prisma.customer.createMany({
        data:[
            {name: 'Arisha Barron'},
            {name: 'Branden Gibson'},
            {name: 'Rhonda Church'},
            {name: 'Georgina Hazel'}
        ]
    })
    console.log("Customers data seeded successfully")

    // Seeding in Employees Data
    const hashedPassword = await bcrypt.hash('password123', 10)
    console.log("Starting employees seeding process ....")
    await prisma.employee.createMany({
        data:[
            {
                username: 'employee1',
                password: hashedPassword,
                name: "Jacques Cousteau",
                role: "teller"
            },
            {
                username: "manager1",
                password: hashedPassword,
                name: "Poseidon no last name",
                role: "manager"
            }
        ]
    })
    console.log("Employees data seeded successfully")
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect()
})
