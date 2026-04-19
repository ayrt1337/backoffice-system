import database from "../src/config/database.js";
import { hashData } from "../src/services/hash.js";
import { systemResources } from "../src/utils/resources-seed.js";

const seed = async (): Promise<void> => {
    const hashPassword = await hashData("admin");

    await database.$transaction(async (tx) => {
        const role = await tx.role.upsert({
            where: { name: "admin" },
            update: {},
            create: {
                name: "admin",
            }
        });

        await tx.user.upsert({
            where: { name: "admin" },
            update: {},
            create: {
                name: "admin",
                password: hashPassword,
                roleId: role.id,
            }
        });
    });

    for (const resource of systemResources) {
        await database.$transaction(async (tx) => {
            const resourceId = await tx.resource.upsert({
                where: { name: resource.name },
                update: { label: resource.label },
                create: {
                    name: resource.name,
                    label: resource.label
                }
            });

            for (const action of resource.actions) {
                await tx.action.upsert({
                    where: { slug: `${resource.name}:${action.name}` },
                    update: {},
                    create: {
                        label: action.label,
                        slug: `${resource.name}:${action.name}`,
                        resourceId: resourceId.id
                    }
                });
            }
        });
    }
}

seed()
    .then(async () => {
        await database.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await database.$disconnect();
        process.exit(1);
    });