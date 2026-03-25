import database from "../src/config/database.js";
import { hashData } from "../src/services/hash.js";

const seed = async (): Promise<void> => {
    const hashPassword = await hashData("admin");

    await database.$transaction(async (tx) => {
        const role = await tx.role.upsert({
            where: { name: "admin" },
            update: {},
            create: {
                name: "admin",
            }
        })

        const user = await tx.user.upsert({
            where: { name: "admin" },
            update: {},
            create: {
                name: "admin",
                password: hashPassword,
                roleId: role.id,
            }
        })

        console.log(`Registered user ${user.name} and role ${role.name}`);
    })
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