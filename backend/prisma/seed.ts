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
        // Enclosures (Kandang)
        { action: 'enclosure.read', description: 'View enclosure/pen data' },
        { action: 'enclosure.write', description: 'Create or update enclosures' },
        { action: 'enclosure.delete', description: 'Delete enclosures' },
        // Transactions / Finance
        { action: 'transaction.read', description: 'View financial transactions' },
        { action: 'transaction.write', description: 'Create or update transactions' },
        // Billing / Invoice
        { action: 'billing.read', description: 'View invoices and billing data' },
        { action: 'billing.write', description: 'Create or update invoices' },
        { action: 'billing.approve', description: 'Approve and finalize invoices' },
        // Inventory
        { action: 'inventory.read', description: 'View inventory items' },
        { action: 'inventory.write', description: 'Create or update inventory items' },
        // Medical Records
        { action: 'medical.read', description: 'View medical/veterinary records' },
        { action: 'medical.write', description: 'Create or update medical records' },
        // Nutrition Calculator
        { action: 'nutrition.read', description: 'Access nutrition calculator and feed data' },
        { action: 'nutrition.write', description: 'Create feed formulations and manage feed ingredients' },
        // Crops / Agriculture
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
                (p.action.startsWith('livestock.') && p.action !== 'livestock.delete') ||
                (p.action.startsWith('crop.') && p.action !== 'crop.delete') ||
                p.action === 'dashboard.read' ||
                p.action === 'media.upload' ||
                p.action === 'medical.read' ||
                p.action === 'inventory.read' ||
                p.action === 'nutrition.read' ||
                p.action === 'enclosure.read' ||
                p.action === 'billing.read' ||
                p.action === 'transaction.read'
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
        // ============ SUMBER ENERGI (BIJI-BIJIAN) — BERAT: biji padat dan berat ============
        { name: 'Jagung Kuning / Corn Grain', dryMatter: 88.0, crudeProtein: 8.5, metabolizableEnergy: 3300, crudeFiber: 2.2, crudeFat: 3.8, ash: 1.5, calcium: 0.02, phosphorus: 0.28, pricePerKg: 6500, category: 'BERAT', tdn: 88.0, ndf: 10.0, stock: 0 },
        { name: 'Sorgum / Grain Sorghum', dryMatter: 89.0, crudeProtein: 9.0, metabolizableEnergy: 3150, crudeFiber: 2.5, crudeFat: 3.0, ash: 1.8, calcium: 0.03, phosphorus: 0.30, pricePerKg: 5000, category: 'BERAT', tdn: 82.0, ndf: 19.0, stock: 0 },
        { name: 'Gandum / Wheat', dryMatter: 88.0, crudeProtein: 11.5, metabolizableEnergy: 3050, crudeFiber: 2.8, crudeFat: 1.8, ash: 1.7, calcium: 0.05, phosphorus: 0.35, pricePerKg: 5500, category: 'BERAT', tdn: 85.0, ndf: 13.0, stock: 0 },
        { name: 'Ubi Kayu / Cassava', dryMatter: 85.0, crudeProtein: 2.5, metabolizableEnergy: 3200, crudeFiber: 3.5, crudeFat: 0.5, ash: 2.5, calcium: 0.12, phosphorus: 0.12, pricePerKg: 2000, category: 'SEDANG', tdn: 82.0, ndf: 9.0, stock: 0 },
        { name: 'Tepung Tapioka', dryMatter: 88.0, crudeProtein: 1.8, metabolizableEnergy: 3450, crudeFiber: 0.5, crudeFat: 0.2, ash: 0.3, calcium: 0.02, phosphorus: 0.05, pricePerKg: 7000, category: 'BERAT', tdn: 88.0, ndf: 2.0, stock: 0 },
        { name: 'Pollard / Wheat Bran', dryMatter: 88.0, crudeProtein: 15.5, metabolizableEnergy: 1800, crudeFiber: 9.5, crudeFat: 4.2, ash: 5.5, calcium: 0.12, phosphorus: 1.05, pricePerKg: 4000, category: 'SEDANG', tdn: 65.0, ndf: 42.0, stock: 0 },

        // ============ SUMBER PROTEIN NABATI — BERAT: tepung padat ============
        { name: 'Bungkil Kedelai / SBM 44%', dryMatter: 89.0, crudeProtein: 44.0, metabolizableEnergy: 2800, crudeFiber: 7.0, crudeFat: 1.5, ash: 6.0, calcium: 0.25, phosphorus: 0.60, pricePerKg: 10500, category: 'BERAT', tdn: 82.0, ndf: 16.0, stock: 0 },
        { name: 'Bungkil Kedelai / SBM 48%', dryMatter: 89.0, crudeProtein: 48.0, metabolizableEnergy: 2900, crudeFiber: 3.5, crudeFat: 1.2, ash: 6.5, calcium: 0.28, phosphorus: 0.65, pricePerKg: 11500, category: 'BERAT', tdn: 85.0, ndf: 8.0, stock: 0 },
        { name: 'Bungkil Kelapa / Copra Meal', dryMatter: 90.0, crudeProtein: 21.0, metabolizableEnergy: 1900, crudeFiber: 12.0, crudeFat: 6.0, ash: 6.5, calcium: 0.20, phosphorus: 0.55, pricePerKg: 4500, category: 'SEDANG', tdn: 72.0, ndf: 65.0, stock: 0 },
        { name: 'Bungkil Sawit / Palm Kernel Cake', dryMatter: 90.0, crudeProtein: 16.0, metabolizableEnergy: 2100, crudeFiber: 18.0, crudeFat: 8.0, ash: 4.5, calcium: 0.25, phosphorus: 0.55, pricePerKg: 2500, category: 'SEDANG', tdn: 70.0, ndf: 55.0, stock: 0 },
        { name: 'Bungkil Kacang Tanah / Peanut Meal', dryMatter: 90.0, crudeProtein: 48.5, metabolizableEnergy: 2800, crudeFiber: 7.5, crudeFat: 1.8, ash: 5.5, calcium: 0.16, phosphorus: 0.55, pricePerKg: 8000, category: 'SEDANG', tdn: 79.0, ndf: 16.0, stock: 0 },

        // ============ SUMBER PROTEIN HEWANI — BERAT: tepung hewani sangat padat ============
        { name: 'Tepung Ikan / Fish Meal 55%', dryMatter: 92.0, crudeProtein: 55.0, metabolizableEnergy: 2800, crudeFiber: 1.0, crudeFat: 8.0, ash: 18.0, calcium: 5.00, phosphorus: 3.00, pricePerKg: 15000, category: 'BERAT', tdn: 72.0, ndf: 0.0, stock: 0 },
        { name: 'Tepung Ikan / Fish Meal 65%', dryMatter: 92.0, crudeProtein: 65.0, metabolizableEnergy: 3000, crudeFiber: 0.5, crudeFat: 6.0, ash: 16.0, calcium: 4.50, phosphorus: 2.80, pricePerKg: 18000, category: 'BERAT', tdn: 76.0, ndf: 0.0, stock: 0 },
        { name: 'Tepung Darah / Blood Meal', dryMatter: 91.0, crudeProtein: 82.0, metabolizableEnergy: 2850, crudeFiber: 0.8, crudeFat: 1.5, ash: 4.5, calcium: 0.28, phosphorus: 0.22, pricePerKg: 12000, category: 'BERAT', tdn: 88.0, ndf: 0.0, stock: 0 },
        { name: 'Tepung Daging Tulang / MBM', dryMatter: 92.0, crudeProtein: 50.0, metabolizableEnergy: 2150, crudeFiber: 2.5, crudeFat: 9.0, ash: 27.0, calcium: 9.40, phosphorus: 4.50, pricePerKg: 9500, category: 'BERAT', tdn: 57.0, ndf: 0.0, stock: 0 },

        // ============ HIJAUAN & ROUGHAGE — RINGAN: serat kasar tinggi, bulky, kamba ============
        { name: 'Rumput Gajah / Napier', dryMatter: 20.0, crudeProtein: 10.0, metabolizableEnergy: 1800, crudeFiber: 30.0, crudeFat: 2.0, ash: 10.0, calcium: 0.40, phosphorus: 0.20, pricePerKg: 500, category: 'RINGAN', tdn: 58.0, ndf: 65.0, stock: 0 },
        { name: 'Rumput Raja / King Grass', dryMatter: 18.0, crudeProtein: 9.5, metabolizableEnergy: 1750, crudeFiber: 32.0, crudeFat: 1.8, ash: 9.5, calcium: 0.35, phosphorus: 0.18, pricePerKg: 450, category: 'RINGAN', tdn: 57.0, ndf: 68.0, stock: 0 },
        { name: 'Jerami Padi / Rice Straw', dryMatter: 88.0, crudeProtein: 4.5, metabolizableEnergy: 1400, crudeFiber: 35.0, crudeFat: 1.5, ash: 17.0, calcium: 0.20, phosphorus: 0.07, pricePerKg: 300, category: 'RINGAN', tdn: 40.0, ndf: 72.0, stock: 0 },
        { name: 'Tumpi Jagung / Corn Husk', dryMatter: 80.0, crudeProtein: 6.0, metabolizableEnergy: 1500, crudeFiber: 30.0, crudeFat: 1.0, ash: 7.0, calcium: 0.25, phosphorus: 0.15, pricePerKg: 350, category: 'RINGAN', tdn: 50.0, ndf: 65.0, stock: 0 },
        { name: 'Daun Singkong / Cassava Leaf', dryMatter: 25.0, crudeProtein: 24.0, metabolizableEnergy: 1900, crudeFiber: 18.0, crudeFat: 5.0, ash: 9.0, calcium: 1.70, phosphorus: 0.38, pricePerKg: 400, category: 'RINGAN', tdn: 62.0, ndf: 38.0, stock: 0 },
        { name: 'Daun Lamtoro / Leucaena Leaf', dryMatter: 25.0, crudeProtein: 26.0, metabolizableEnergy: 2100, crudeFiber: 15.0, crudeFat: 4.5, ash: 7.5, calcium: 1.60, phosphorus: 0.22, pricePerKg: 350, category: 'RINGAN', tdn: 65.0, ndf: 35.0, stock: 0 },

        // ============ LIMBAH AGROINDUSTRI — SEDANG: kepadatan menengah ============
        { name: 'Dedak Padi / Rice Bran', dryMatter: 90.0, crudeProtein: 12.0, metabolizableEnergy: 2100, crudeFiber: 13.0, crudeFat: 12.0, ash: 11.0, calcium: 0.05, phosphorus: 1.50, pricePerKg: 3500, category: 'SEDANG', tdn: 65.0, ndf: 28.0, stock: 0 },
        { name: 'Ampas Tahu / Tofu By-product', dryMatter: 15.0, crudeProtein: 26.0, metabolizableEnergy: 2450, crudeFiber: 20.0, crudeFat: 12.0, ash: 3.5, calcium: 0.40, phosphorus: 0.35, pricePerKg: 1000, category: 'SEDANG', tdn: 76.0, ndf: 42.0, stock: 0 },
        { name: 'Onggok / Cassava Pulp', dryMatter: 85.0, crudeProtein: 2.5, metabolizableEnergy: 3100, crudeFiber: 14.0, crudeFat: 0.5, ash: 2.0, calcium: 0.16, phosphorus: 0.03, pricePerKg: 1500, category: 'SEDANG', tdn: 78.0, ndf: 12.0, stock: 0 },
        { name: 'Molasses / Tetes Tebu', dryMatter: 75.0, crudeProtein: 4.2, metabolizableEnergy: 2450, crudeFiber: 0.0, crudeFat: 0.1, ash: 9.5, calcium: 1.00, phosphorus: 0.09, pricePerKg: 2200, category: 'BERAT', tdn: 75.0, ndf: 0.0, stock: 0 },
        { name: 'Ampas Bir / Brewery Grain', dryMatter: 22.0, crudeProtein: 24.0, metabolizableEnergy: 2000, crudeFiber: 16.5, crudeFat: 7.0, ash: 4.5, calcium: 0.28, phosphorus: 0.60, pricePerKg: 1800, category: 'SEDANG', tdn: 63.0, ndf: 52.0, stock: 0 },

        // ============ SUPLEMEN MINERAL — BERAT: mineral sangat padat ============
        { name: 'Tepung Kapur / Limestone', dryMatter: 99.0, crudeProtein: 0.0, metabolizableEnergy: 0, crudeFiber: 0.0, crudeFat: 0.0, ash: 96.0, calcium: 36.00, phosphorus: 0.02, pricePerKg: 1500, category: 'BERAT', tdn: 0.0, ndf: 0.0, stock: 0 },
        { name: 'Dicalcium Phosphate (DCP)', dryMatter: 96.0, crudeProtein: 0.0, metabolizableEnergy: 0, crudeFiber: 0.0, crudeFat: 0.0, ash: 95.0, calcium: 22.00, phosphorus: 18.00, pricePerKg: 12000, category: 'BERAT', tdn: 0.0, ndf: 0.0, stock: 0 },
        { name: 'Garam Dapur / Salt (NaCl)', dryMatter: 100.0, crudeProtein: 0.0, metabolizableEnergy: 0, crudeFiber: 0.0, crudeFat: 0.0, ash: 100.0, calcium: 0.00, phosphorus: 0.00, pricePerKg: 2000, category: 'BERAT', tdn: 0.0, ndf: 0.0, stock: 0 },
        { name: 'Minyak Sawit / Palm Oil (CPO)', dryMatter: 100.0, crudeProtein: 0.0, metabolizableEnergy: 8600, crudeFiber: 0.0, crudeFat: 99.0, ash: 0.0, calcium: 0.00, phosphorus: 0.00, pricePerKg: 14000, category: 'BERAT', tdn: 190.0, ndf: 0.0, stock: 0 },
    ];

    for (const feed of masterFeeds) {
        const exists = await prisma.feedIngredient.findFirst({ where: { name: feed.name, tenantId: null } });
        if (!exists) {
            await prisma.feedIngredient.create({ data: { ...feed, tenantId: null } });
        } else {
            // Update existing dengan category, tdn, ndf yang sekarang ada
            await prisma.feedIngredient.update({
                where: { id: exists.id },
                data: { category: (feed as any).category, tdn: (feed as any).tdn, ndf: (feed as any).ndf }
            });
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
