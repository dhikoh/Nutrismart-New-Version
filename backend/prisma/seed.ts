import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Zero-Trust RBAC System...');

    // 1. Define Core Permissions
    const permissions = [
        // Dashboard
        { action: 'dashboard.read', description: 'View tenant dashboard stats' },
        // Livestock
        { action: 'livestock.read', description: 'View livestock data' },
        { action: 'livestock.write', description: 'Create or update livestock data' },
        { action: 'livestock.delete', description: 'Delete livestock data' },
        // Transactions
        { action: 'transaction.read', description: 'View financial transactions' },
        { action: 'transaction.write', description: 'Create or update transactions' },
        // Crops
        { action: 'crop.read', description: 'View crop phases' },
        { action: 'crop.write', description: 'Manage crop phases' },
        // AI
        { action: 'ai.read', description: 'Access AI recommendations' },
        // Settings & Media
        { action: 'settings.manage', description: 'Manage tenant settings' },
        { action: 'media.upload', description: 'Upload media files' }
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { action: perm.action },
            update: {},
            create: perm,
        });
    }

    const allPerms = await prisma.permission.findMany();

    // 2. Define Roles
    const roles = [
        { name: 'OWNER', description: 'Tenant Owner with full access' },
        { name: 'STAFF', description: 'Farm worker with limited operational access' }
    ];

    for (const r of roles) {
        const roleRecord = await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: { name: r.name, description: r.description },
        });

        // 3. Assign Permissions to Roles
        if (r.name === 'OWNER') {
            // Owner gets ALL permissions
            for (const p of allPerms) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: roleRecord.id, permissionId: p.id } },
                    update: {},
                    create: { roleId: roleRecord.id, permissionId: p.id },
                });
            }
        } else if (r.name === 'STAFF') {
            // Staff gets specific operational permissions
            const staffPerms = allPerms.filter((p: { action: string }) =>
                p.action.startsWith('livestock.') && p.action !== 'livestock.delete' ||
                p.action.startsWith('crop.') && p.action !== 'crop.delete' ||
                p.action === 'dashboard.read' ||
                p.action === 'media.upload'
            );
            for (const p of staffPerms) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: roleRecord.id, permissionId: p.id } },
                    update: {},
                    create: { roleId: roleRecord.id, permissionId: p.id },
                });
            }
        }
    }

    // 4. Create Default Tenant & Owner for MVP Testing
    console.log('Provisioning Default Tenant and Owner Account...');

    const defaultTenant = await prisma.tenant.upsert({
        where: { slug: 'modula-hq' },
        update: {},
        create: {
            name: 'Modula HQ Farm',
            slug: 'modula-hq',
        }
    });

    const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } });
    if (!ownerRole) throw new Error('OWNER role not found during seeding');

    const hashedPassword = await bcrypt.hash('Pediavet@2026', 10);

    // We use findFirst to check if user exists since we'll upsert via isolated fields
    let superAdmin = await prisma.user.findUnique({
        where: { email: 'admin@pediavet.com' }
    });

    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
                email: 'admin@pediavet.com',
                username: 'superadmin',
                password: hashedPassword,
                name: 'System Administrator',
                tenantId: defaultTenant.id,
                userRoles: {
                    create: {
                        roleId: ownerRole.id
                    }
                }
            }
        });
        console.log('✅ Created Default Admin (admin@pediavet.com / Pediavet@2026)');
    } else {
        console.log('ℹ️ Default Admin already exists.');
    }

    console.log('RBAC Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
