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

    // 5. Build Master Nutrition Database (Global / No Tenant)
    console.log('Seeding Master Nutrition Database (Feed Ingredients & NRC)...');

    const masterFeeds = [
        { name: 'Jagung Kuning (Corn)', dryMatter: 88, crudeProtein: 8.5, metabolizableEnergy: 3300, crudeFiber: 2.2, crudeFat: 3.8, ash: 1.5, calcium: 0.02, phosphorus: 0.28, pricePerKg: 6500 },
        { name: 'Bungkil Kedelai (SBM)', dryMatter: 89, crudeProtein: 46.0, metabolizableEnergy: 2800, crudeFiber: 6.0, crudeFat: 1.5, ash: 6.0, calcium: 0.25, phosphorus: 0.60, pricePerKg: 10500 },
        { name: 'Dedak Padi (Rice Bran)', dryMatter: 90, crudeProtein: 12.0, metabolizableEnergy: 2100, crudeFiber: 13.0, crudeFat: 12.0, ash: 11.0, calcium: 0.05, phosphorus: 1.50, pricePerKg: 3500 },
        { name: 'Tepung Ikan (Fish Meal)', dryMatter: 92, crudeProtein: 55.0, metabolizableEnergy: 2800, crudeFiber: 1.0, crudeFat: 8.0, ash: 18.0, calcium: 5.0, phosphorus: 3.0, pricePerKg: 15000 },
        { name: 'Bungkil Sawit (PKC)', dryMatter: 90, crudeProtein: 16.0, metabolizableEnergy: 2100, crudeFiber: 18.0, crudeFat: 8.0, ash: 4.5, calcium: 0.25, phosphorus: 0.55, pricePerKg: 2500 },
        { name: 'Rumput Gajah (Napier)', dryMatter: 20, crudeProtein: 10.0, metabolizableEnergy: 1800, crudeFiber: 30.0, crudeFat: 2.0, ash: 10.0, calcium: 0.40, phosphorus: 0.20, pricePerKg: 500 }
    ];

    for (const feed of masterFeeds) {
        // Find existing to avoid duplicates on re-seed
        const exists = await prisma.feedIngredient.findFirst({ where: { name: feed.name, tenantId: null } });
        if (!exists) {
            await prisma.feedIngredient.create({ data: feed });
        }
    }

    const nrcStandards = [
        // Energy explicitly converted to Kcal/kg (e.g. 2.5 Mcal = 2500 Kcal)
        { species: 'BOVINE', stage: 'GROWTH', weightRange: '200-300', reqDryMatter: 6.5, reqCrudeProtein: 13.0, reqEnergy: 2400, reqCalcium: 0.45, reqPhosphorus: 0.25 },
        { species: 'BOVINE', stage: 'LACTATION', weightRange: '400-500', reqDryMatter: 14.5, reqCrudeProtein: 16.0, reqEnergy: 2600, reqCalcium: 0.60, reqPhosphorus: 0.35 },
        { species: 'CAPRINE', stage: 'GROWTH', weightRange: '20-30', reqDryMatter: 0.8, reqCrudeProtein: 14.0, reqEnergy: 2400, reqCalcium: 0.50, reqPhosphorus: 0.30 },
        { species: 'POULTRY', stage: 'GROWTH', weightRange: '0.1-1.0', reqDryMatter: 0.0, reqCrudeProtein: 21.0, reqEnergy: 3100, reqCalcium: 1.0, reqPhosphorus: 0.45 },
    ];

    for (const std of nrcStandards) {
        const exists = await prisma.nrcStandard.findFirst({
            where: { species: std.species, stage: std.stage, weightRange: std.weightRange }
        });
        if (!exists) {
            await prisma.nrcStandard.create({ data: std });
        }
    }

    console.log('RBAC & Nutrition Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
