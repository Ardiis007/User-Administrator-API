const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const bcrypt = require('bcrypt');

async function main() {
    console.log('Initializing seeding process');
    const permissionsData = [
        { code: 'Create User', description: 'Create a new user, assign them a name, email, password, status and role' },
        { code: 'Get User', description: 'View the user information' },
        { code: 'Update User', description: 'Change user name or email or password' },
        { code: 'Delete User', description: 'Delete user' },
        { code: 'List User', description: 'View the list of existing users' },
        { code: 'Create Role', description: 'Create a role and defined his hierarchy level' },
        { code: 'Get Role', description: 'View the name, hierarchy level and permissions of a role' },
        { code: 'Update Role', description: 'Change the role, hierarchy level and permissions of a role' },
        { code: 'Delete Role', description: 'Delete role' },
        { code: 'List Role', description: 'View the list of existing roles, and his permissions'},
        { code: 'Get Permission', description: 'View the permission name and its description' },
        { code: 'Update Permission', description: 'Change the name or description of a permission' },
        { code: 'Delete Permission', description: 'Delete a permission' },
        { code: 'List Permission', description: 'View the list of existing permissions'},
        { code: 'ChangeUserStatus', description: 'Change the status of an user' }
    ];

    for (const perm of permissionsData) {
        await prisma.permission.upsert({
            where: {
                code: perm.code
            },
            update: {},
            create: perm
        });
    }
    console.log('Permissions created successfully');

    const allPermissions = await prisma.permission.findMany();
    const rootRole = await prisma.role.upsert({
        where: {
            name: 'ROOT'
        },
        update: {},
        create: {
            name: 'ROOT',
            hierarchyLevel: 1,
            permissions: {
                connect: allPermissions.map(p => ({ id: p.id }))
            }
        }
    });
    console.log('ROOT role created successfully');

    await prisma.role.upsert({
        where: {
            name: 'USER'
        },
        update: {},
        create: {
            name: 'USER',
            hierarchyLevel: 10
        }
    });
    console.log('Default USER role created successfully');

    const salt = await bcrypt.genSalt(10);
    const hashedRootPassword = await bcrypt.hash('Roothorus321', salt);

    const rootUser = await prisma.user.upsert({
        where: {
            email: 'root@horus.com'
        },
        update: {},
        create: {
            name: 'Admin Root',
            email: 'root@horus.com',
            password: hashedRootPassword,
            status: true,
            roleId: rootRole.id
        }
    });
    console.log(`ROOT user initialized in email: ${rootUser.email}`);
}

main()
    .catch((error) => {
        console.error('Error during seeding:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });